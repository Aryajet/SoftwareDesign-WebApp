<script lang="ts">
    // Enum for volunteer skills
  
    import type { PageData } from './$types';
    import { supabase } from '$lib/supabaseClient';
    
      export let data: PageData;
      let { user } = data;
      let isLoading = true;
    
      // Variables for profile information
      let full_name = '';
      let first_name = '';
      let last_name = '';
      let username = '';
      let role: 'Volunteer' | 'Organizer' | '' = ''; // Start with an empty string if necessary
      let email = '';
      // Variables for availability
      let tempAvailabilityDates: string[] = [];
      // Variables for skills
      let selectedSkills: string[] = [];
      let state = 'Texas';
    
      async function loadProfile() 
      {
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, full_name, username, availability, skills, role, email, state')
            .eq('id', user.id)
            .single();
    
          if (error) {
            console.error('Error loading profile:', error.message);
          } else if (profile) {
            full_name = profile.full_name || '';
            first_name = profile.first_name || '';
            last_name = profile.last_name || '';
            username = profile.username || '';
            tempAvailabilityDates = profile.availability || [];
            selectedSkills = [...(profile.skills || []), null];
            role = profile.role || '';
            email = user.user_metadata.email || '';
            state = profile.state;
          }
        }
      }

      loadProfile();

      class Event 
      {
        event_id: string;
        eventName: string;
        eventDescription: string;
        location: string;
        requiredSkill1: string;
        requiredSkill2: string;
        requiredSkill3: string;
        urgency: string;
        eventDate: string;

        constructor(event_id: string, eventName: string, eventDescription: string, location: string, requiredSkill1: string, requiredSkill2: string, requiredSkill3: string, urgency: string, eventDate: string) {
        this.event_id = event_id;
        this.eventName = eventName;
        this.eventDescription = eventDescription;
        this.location = location;
        this.requiredSkill1 = requiredSkill1;
        this.requiredSkill2 = requiredSkill2;
        this.requiredSkill3 = requiredSkill3;
        this.urgency = urgency;
        this.eventDate = eventDate;
        }
      }

      let events: Event[] = []; // Array to store events fetched from Supabase
      let specificEvents: Event[] = []; // Array to store events fetched from Supabase


      async function matchEvents() {
        const { data, error } = await supabase
            .from('Event_Table') // Make sure this matches your table name
            .select('event_id, event_name, description, location, required_skill1, date, urgency, required_skill2, required_skill3, notifications')
            .order('date', { ascending: true });
            if (error) {
            console.error('Error fetching events:', error.message);
            return;
            }
            console.log("Events fetched successfully:", data);
            events = data.map(event => new Event(
                event.event_id,
                event.event_name,
                event.description,
                event.location,
                event.required_skill1,
                event.required_skill2,
                event.required_skill3,
                event.urgency,
                event.date
            ));
            specificEvents = filterSpecificEvent();
            isLoading = false;
            //specificEvents = events;
      }
      
      matchEvents();

      function filterSpecificEvent() {
            return events.filter(event => event.location === state && tempAvailabilityDates.includes(event.eventDate)
             && selectedSkills.includes(event.requiredSkill1) && selectedSkills.includes(event.requiredSkill2) && selectedSkills.includes(event.requiredSkill3));
        }

    let eventToFilter;
    
    function findVolunteers()
    {
        let stateM = eventToFilter.location;
        let dateM = eventToFilter.eventDate;
        let skill1M = eventToFilter.requiredSkill1;
        let skill2M = eventToFilter.requiredSkill2;
        let skill3M = eventToFilter.requiredSkill3;
        specificVolunteers = filterSpecificVolunteer(stateM, dateM, skill1M, skill2M, skill3M);
    }

    class Volunteer
    {
        id: string;
        fullName: string;
        availability: string[];
        location: string;
        skills: string[];

        constructor(id: string, fullName: string, availability: string[], location: string, skills: string[]) 
        {
            this.id = id;
            this.fullName = fullName;
            this.availability = availability;
            this.location = location;
            this.skills = [...(skills || []), null];
        }
    }

    let volunteers: Volunteer[] = [];
    let specificVolunteers: Volunteer[] = []; 

    async function matchVolunteers() {
        const { data, error } = await supabase
            .from('profiles') // Make sure this matches your table name
            .select('id, full_name, availability, location, skills')
            .order('id', { ascending: true });
            if (error) {
            console.error('Error fetching events:', error.message);
            return;
            }
            console.log("Events fetched successfully:", data);
            volunteers = data.map(volunteer => new Volunteer(
                volunteer.id,
                volunteer.full_name,
                volunteer.availability,
                volunteer.location,
                volunteer.skills
            ));
            isLoading = false;
      }
      
      matchVolunteers();

      function filterSpecificVolunteer(stateM, dateM, skill1M, skill2M, skill3M) {
            return volunteers.filter(volunteer => volunteer.location === stateM && volunteer.availability.includes(dateM) 
            && volunteer.skills.includes(skill1M) && volunteer.skills.includes(skill2M) && volunteer.skills.includes(skill3M));
        }
        
  </script>
  <div class="flex flex-col w-full max-w-4xl mx-auto mt-8 p-4">
    {#if isLoading}
    <div class="flex justify-center items-center h-48">
      <div class="loader">Loading...</div>
    </div>
    {:else}
    <h1 class="text-xl font-bold mb-10">Volunteer Matching For {role}</h1>
        {#if role=="Volunteer"}
            <h2 class="text-xl font-semibold mb-4">Matched Events</h2>
            <div class="overflow-x-auto">
            <table class="table w-full bg-base-100">
                <thead>
                <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Skill 1</th>
                    <th>Skill 2</th>
                    <th>Skill 3</th>
                    <th>Urgency</th>
                    <th>Date</th>
                    <th>Check (Toggle)</th>
                </tr>
                </thead>
                <tbody>
                    {#each specificEvents as event}
                        <tr>
                            <td>{event.event_id}</td>
                            <td>{event.eventName}</td>
                            <td>{event.eventDescription}</td>
                            <td>{event.location}</td>
                            <td>{event.requiredSkill1}</td>
                            <td>{event.requiredSkill2}</td>
                            <td>{event.requiredSkill3}</td>
                            <td>{event.urgency}</td>
                            <td>{event.eventDate}</td>
                            <td><input type="checkbox"/></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            </div>
    {:else if role=="Organizer"}
        <h2 class="text-xl font-semibold mb-4">Match Event with Volunteers</h2>
        <label for="eventFilter" class="label">Event To Check:</label>
            <select id="eventFilter" bind:value={eventToFilter} class="select select-bordered w-50" on:click={findVolunteers}>
                {#each events as item}
                    <option value={item}>Item Number {item.event_id}: {item.eventName} -- {item.eventDescription}</option>
                {/each}
            </select>
        <div class="overflow-x-auto">
        <table class="table w-full bg-base-100">
            <thead>
            <tr>
                <th>Volunteer ID</th>
                <th>Full Name</th>
                <th>Location</th>
                <th>Add Volunteer To Event</th>
            </tr>
            </thead>
            <tbody>
                {#each specificVolunteers as v}
                    <tr>
                        <td>{v.id}</td>
                        <td>{v.fullName}</td>
                        <td>{v.location}</td>
                        <td><input type="checkbox"/></td>
                    </tr>
                {/each}
            </tbody>
        </table>
        </div>
    {/if}
    {/if}
  </div>