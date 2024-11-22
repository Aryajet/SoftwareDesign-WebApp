<script lang="ts">
  import type { PageData } from './$types';
  import { supabase } from '$lib/supabaseClient';

  export let data: PageData;
  let { user } = data;

  // Reactive variables

    // Variables for profile information
  let full_name = '';
  let first_name = '';
  let last_name = '';
  let username = '';
  let role: 'Volunteer' | 'Organizer';
  let email = '';

  // Variables for availability
  let tempAvailabilityDates: string[] = [];
  let selectedSkills: string[] = [];

  async function loadProfile() {
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, full_name, username, availability, skills, role, email')
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
        selectedSkills = profile.skills || [];
        role = profile.role;
        email = user.user_metadata.email || '';
        nameFilter = full_name;
      }
    }
  }

  let eventHistory2 = [];
  let nameFilter = '';
  let eventFilter = '';

  // Fetch data from Supabase
  async function fetchEvents() {
    const { data: events, error: eventError } = await supabase
      .from('Event_Table')
      .select(`
        event_id,
        event_name,
        description,
        date,
        urgency,
        required_skill1,
        required_skill2,
        required_skill3,
        location
      `);

    if (eventError) {
      console.error('Error fetching events:', eventError);
      return;
    }

    // Fetch profiles to match with event participants
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        event_history
      `);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }

    // Map events to include volunteer data where available
    eventHistory2 = events.map(event => {
      // Find matching profiles based on event history
      const participants = profiles.filter(profile =>
        profile.event_history?.includes(event.event_id)
      );

      return {
        id: event.event_id,
        name: participants.map(p => p.full_name).join(', ') || 'No Participants',
        event: event.event_name,
        description: event.description,
        date: event.date,
        urgency: event.urgency,
        skills: [event.required_skill1, event.required_skill2, event.required_skill3].filter(Boolean),
        location: event.location,
        participation: participants.length > 0 ? 'Participated' : 'No Participation',
        performance: participants.length > 0 ? 'Unknown' : 'N/A' // Placeholder for performance data
      };
    });
  }

  // Filtering functions
  const filterVolunteerHistory = name => {
    return eventHistory2.filter(history =>
      !name || history.name.toLowerCase().includes(name.toLowerCase())
    );
  };

  const filterEventHistory = event => {
    return eventHistory2.filter(history =>
      !event || history.event.toLowerCase().includes(event.toLowerCase())
    );
  };

  function applyFilter() {
    eventHistory2 = filterVolunteerHistory(nameFilter);
  }

  function applyFilter2() {
    eventHistory2 = filterEventHistory(eventFilter);
  }

  // Fetch events on component mount
  fetchEvents();
  loadProfile();
</script>

<h2 class="text-xl font-semibold mb-4 text-center">Volunteer History {role}</h2>
{#if role=="Organizer"}
  <div class="overflow-x-auto">
    <div class="flex items-center mb-4 space-x-2 justify-center items-center">
      <label for="nameFilter" class="label">
        <span class="label-text">Filter by Name:</span>
      </label>
      <input
        type="text"
        id="nameFilter"
        bind:value={nameFilter}
        class="input input-bordered w-64"
      />
      <button class="btn btn-primary w-20" on:click={applyFilter}>Apply</button>
      <p class="w-40"></p>
      <label for="eventFilter" class="label">
        <span class="label-text">Filter by Event:</span>
      </label>
      <input
        type="text"
        id="eventFilter"
        bind:value={eventFilter}
        class="input input-bordered w-64"
      />
      <button class="btn btn-primary w-20" on:click={applyFilter2}>Apply</button>
    </div>
    <table class="table w-full bg-base-100">
      <thead>
        <tr>
          <th>Name</th>
          <th>Event</th>
          <th>Description</th>
          <th>Date</th>
          <th>Skills</th>
          <th>Urgency</th>
          <th>Location</th>
          <th>Participation</th>
          <th>Performance</th>
        </tr>
      </thead>
      <tbody>
        {#each eventHistory2 as event1}
          <tr>
            <td>{event1.name}</td>
            <td>{event1.event}</td>
            <td>{event1.description}</td>
            <td>{event1.date}</td>
            <td>{event1.skills.join(', ')}</td>
            <td>{event1.urgency}</td>
            <td>{event1.location}</td>
            <td>{event1.participation}</td>
            <td>{event1.performance}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else if role=="Volunteer"}
<div class="overflow-x-auto">
  <div class="flex items-center mb-4 space-x-2 justify-center items-center">
    <label for="nameFilter" class="label">
      <span class="label-text">Filter by Your Name:</span>
    </label>
    <button class="btn btn-primary w-50" on:click={applyFilter}>Apply</button>
      </div>
      <table class="table w-full bg-base-100">
        <thead>
          <tr>
            <th>Name</th>
            <th>Event</th>
            <th>Description</th>
            <th>Date</th>
            <th>Skills</th>
            <th>Urgency</th>
            <th>Location</th>
            <th>Participation</th>
            <th>Performance</th>
          </tr>
        </thead>
        <tbody>
          {#each eventHistory2 as event1}
            <tr>
              <td>{event1.name}</td>
              <td>{event1.event}</td>
              <td>{event1.description}</td>
              <td>{event1.date}</td>
              <td>{event1.skills.join(', ')}</td>
              <td>{event1.urgency}</td>
              <td>{event1.location}</td>
              <td>{event1.participation}</td>
              <td>{event1.performance}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
{/if}
