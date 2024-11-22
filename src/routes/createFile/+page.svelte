<script lang="ts">
    // Enum for volunteer skills
  
    import type { PageData } from './$types';
    import { supabase } from '$lib/supabaseClient';
    
    import { jsPDF } from 'jspdf';

    function generateCombinedPDF() {
    const doc = new jsPDF();
    
    let y = 20;  // Start y position for the content

    // Function to check if content exceeds the page height
    const checkPageOverflow = () => {
      if (y > doc.internal.pageSize.height - 20) {  // 20 is for margin
        doc.addPage();
        y = 20;  // Reset the y position for new page
      }
    };

    // *** Events Section ***
    doc.setFontSize(16);
    doc.text('*** Events ***', 10, y);
    y += 10;

    // Loop through events and add them to the PDF
    events.forEach(event => {
      doc.setFontSize(12);
      Object.entries(event).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 10, y);
        y += 6;
        checkPageOverflow();  // Check if we need to add a new page
      });
      y += 12;
    });

    // *** Volunteers Section ***
    doc.setFontSize(16);
    doc.text('*** Volunteers List ***', 10, y);
    y += 10;

    // Loop through volunteers and add them to the PDF
    volunteers.forEach(volunteer => {
      doc.setFontSize(12);
      Object.entries(volunteer).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 10, y);
        y += 6;
        checkPageOverflow();  // Check if we need to add a new page
      });
      y += 12;
    });

    checkPageOverflow();
    // *** Volunteers Mapped to Events Section ***
    doc.setFontSize(16);
    doc.text('\n\n',10,y);
    doc.text('*** Volunteers List (Mapped Events) ***', 10, y);
    y += 10;
    checkPageOverflow();
    // Loop through volunteers to map their events
    volunteers.forEach(volunteer => {
      doc.setFontSize(12);
      doc.text(`Volunteer ID: ${volunteer.id}`, 10, y);
      y += 6;
      checkPageOverflow();  // Check if we need to add a new page

      doc.text(`Full Name: ${volunteer.fullName}`, 10, y);
      y += 6;
      checkPageOverflow();

      // Mapping eventHistory to event names
      const volunteerEvents = volunteer.eventHistory
        ? volunteer.eventHistory.map(eventId => eventIdToName[eventId] || "Unknown Event").join("; ")
        : "No Events";
      
      doc.text(`Volunteer Events: ${volunteerEvents}`, 10, y);
      y += 12;
      checkPageOverflow();  // Check if we need to add a new page
    });

    // Trigger the download of the generated PDF
    doc.save('Combined_Data.pdf');
  }
    
      export let data: PageData;
      let { user } = data;
    
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
      let state1 = 'Texas';
      let event_history: number[] = [];

      async function loadProfile() 
      {
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, full_name, username, availability, skills, role, email, event_history')
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
            event_history = profile.event_history
          }
        }
      }

      loadProfile();

      class Event 
      {
        event_id: number;
        eventName: string;
        eventDescription: string;
        location: string;
        requiredSkill1: string;
        requiredSkill2: string;
        requiredSkill3: string;
        urgency: string;
        eventDate: string;

        constructor(event_id: number, eventName: string, eventDescription: string, location: string, requiredSkill1: string, requiredSkill2: string, requiredSkill3: string, urgency: string, eventDate: string) {
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

      let eventIdToName = {};

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
            eventIdToName = Object.fromEntries(data.map(event => [event.event_id, event.event_name]));
      }
      
      matchEvents();

    class Volunteer
    {
        id: string;
        fullName: string;
        availability: string[];
        location: string;
        skills: string[];
        eventHistory: number[];

        constructor(id: string, fullName: string, availability: string[], location: string, skills: string[], event_history: number[]) 
        {
            this.id = id;
            this.fullName = fullName;
            this.availability = availability || null;
            this.location = location;
            this.skills = [...(skills || []), null];
            this.eventHistory = event_history || null;
        }
    }

    let volunteers: Volunteer[] = [];

    async function matchVolunteers() {
        const { data, error } = await supabase
            .from('profiles') // Make sure this matches your table name
            .select('id, full_name, availability, location, skills, event_history,role')
            .order('id', { ascending: true });
            if (error) {
            console.error('Error fetching events:', error.message);
            return;
            }
            console.log("Events fetched successfully:", data);
            volunteers = (data || [])
                .filter(volunteer => volunteer.role === 'Volunteer') // Only include volunteers with role 'Volunteer'
                .map(volunteer => new Volunteer(
                    volunteer.id,
                    volunteer.full_name,
                    volunteer.availability,
                    volunteer.location,
                    volunteer.skills,
                    volunteer.event_history
                ));
      }
      
      matchVolunteers();

  function generateCombinedCSV() {
  let csvContent = "***Events***\n\n\n";

  // Format Events as Key-Value pairs (e.g., event_id: 2)
  events.forEach(event => {
    for (const [key, value] of Object.entries(event)) {
      csvContent += `${key}: ${value}\n`;  // Format as key: value
    }
    csvContent += "\n";  // Add space between each event's data
  });

    csvContent += "\n***Volunteers List***\n\n\n";
    
    // Format Volunteers as Key-Value pairs
    volunteers.forEach(volunteer => {
        for (const [key, value] of Object.entries(volunteer)) {
        csvContent += `${key}: ${value}\n`;  // Format as key: value
        }
        csvContent += "\n";  // Add space between each volunteer's data
    });

    csvContent += "\n***Volunteers List (Mapped Events)***\n\n\n";

    // Format Volunteers List with Mapped Events (e.g., volunteer ID: 12d2ad4c-...)
    volunteers.forEach(volunteer => {
        csvContent += `Volunteer ID: ${volunteer.id}\n`;
        csvContent += `Full Name: ${volunteer.fullName}\n`;

        // Mapping eventHistory to event names
        const volunteerEvents = volunteer.eventHistory
        ? volunteer.eventHistory.map(eventId => eventIdToName[eventId] || "Unknown Event").join("; ")
        : "No Events";

        csvContent += `Volunteer Events: ${volunteerEvents}\n`;
        csvContent += "\n";  // Add space between each volunteer's data
    });

    // Create the CSV file and trigger the download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Combined_Data.csv";
    link.click();
    }


  </script>
  
  <div>
  <div class="flex flex-col w-full max-w-4xl mx-auto mt-8 p-4 hidden">
        <h2 class="text-xl font-semibold mb-4">Events</h2>
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
            </tr>
            </thead>
            <tbody>
                {#each events as event}
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
                    </tr>
                {/each}
            </tbody>
        </table>
        </div>


        <div>
        <h2 class="text-xl font-semibold mb-4">Volunteers List</h2>
        <table class="table w-full bg-base-100">
            <thead>
            <tr>
                <th>Volunteer ID</th>
                <th>Full Name</th>
                <th>Location</th>
                <th>Event History</th>
                <th>Skills</th>
                <th>Availability</th>
            </tr>
            </thead>
            <tbody>
                {#each volunteers as v}
                    <tr>
                        <td>{v.id}</td>
                        <td>{v.fullName}</td>
                        <td>{v.location}</td>
                        <td>{v.eventHistory}</td>
                        <td>{v.skills}</td>
                        <td>{v.availability}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        </div>
        
        <div>
            <h2 class="text-xl font-semibold mb-4">Volunteers</h2>
            <table class="table w-full bg-base-100">
              <thead>
                <tr>
                  <th>Volunteer ID</th>
                  <th>Full Name</th>
                  <th>Volunteer Events</th>
                </tr>
              </thead>
              <tbody>
                {#each volunteers as v}
                  <tr>
                    <td>{v.id}</td>
                    <td>{v.fullName}</td>
                    <td>
                        {#if v.eventHistory}
                            <ul>
                                {#each v.eventHistory as eventId}
                                <li>- {eventIdToName[eventId] || 'Unknown Event'}</li>
                                {/each}
                            </ul>
                        {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
        </div>

  </div>
  {#if role=="Organizer"}
    <div class="container">
        <h1>Generate PDF and CSV with Event and Volunteer Data</h1>
        <div class="button-container">
        <button on:click={generateCombinedPDF} class="btn btn-primary">Download Combined PDF</button>
        <button on:click={generateCombinedCSV} class="btn btn-primary">Download Combined CSV</button>
        </div>
    </div>
    {/if}
</div>
  
  <style>
    /* Ensure the body takes the full height of the viewport */
    html, body {
      height: 100%;
      margin: 0;
    }
  
    /* Center content vertically and horizontally using Flexbox */
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      font-size: 35px;
      padding: 20px;
    }
  
    /* Style the button container to center the buttons horizontally */
    .button-container {
      display: flex;
      flex-direction: column;
      gap: 20px; /* Add space between buttons */
      justify-content: center;
      align-items: center;
    }
  
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      border-radius: 5px;
      background-color: #007bff;
      color: white;
      width: 200px; /* Make button width consistent */
    }
  
    button:hover {
      background-color: #0056b3;
    }
  </style>