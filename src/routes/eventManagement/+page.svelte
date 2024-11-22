<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';

  // Define the Event class to structure event properties
  class Event {
    event_id: string;
    eventName: string;
    eventDescription: string;
    location: string;
    requiredSkills: string[];
    urgency: string;
    eventDate: string;

    constructor(event_id: string, eventName: string, eventDescription: string, location: string, requiredSkills: string[], urgency: string, eventDate: string) {
      this.event_id = event_id;
      this.eventName = eventName;
      this.eventDescription = eventDescription;
      this.location = location;
      this.requiredSkills = requiredSkills;
      this.urgency = urgency;
      this.eventDate = eventDate;
    }
  }

  let events: Event[] = []; // Array to store events fetched from Supabase

  // Form fields
  let eventName: string = '';
  let eventDescription: string = '';
  let location: string = '';
  let requiredSkills: string[] = [];
  let urgency: string = '';
  let eventDate: string = '';

  const skillsOptions: string[] = ['Teamwork', 'Leadership', 'Empathy', 'Reliability', 'Communication'];
  const urgencyOptions: string[] = ['Low', 'Medium', 'High'];

  // Fetch events from the Supabase database
  async function fetchEvents() {
    console.log("Fetching events from Supabase...");
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
      [event.required_skill1, event.required_skill2, event.required_skill3].filter(Boolean),
      event.urgency,
      event.date
    ));
  }

  // Insert a new event into Supabase
  async function handleSubmit() {
    if (!eventName) return;
    
    const newEvent = {
      event_name: eventName,
      description: eventDescription,
      location: location,
      required_skill1: requiredSkills[0] || null,
      required_skill2: requiredSkills[1] || null,
      required_skill3: requiredSkills[2] || null,
      urgency: urgency,
      date: eventDate
    };

    console.log("Inserting event into Supabase:", newEvent);
    const { data, error } = await supabase
      .from('Event_Table')
      .insert([newEvent]);

    if (error) {
      console.error('Error adding event:', error.message);
    } else {
      console.log("Event added successfully:", data);
      await fetchEvents(); // Refresh events list
      resetForm(); // Clear form inputs
    }
  }

  // Reset form fields
  function resetForm() {
    console.log("Resetting form fields...");
    eventName = '';
    eventDescription = '';
    location = '';
    requiredSkills = [];
    urgency = '';
    eventDate = '';
  }

  // Delete an event from Supabase
  async function deleteEvent(eventId: string) {
    console.log("Deleting event with ID:", eventId);
    const { data, error } = await supabase
      .from('Event_Table')
      .delete()
      .eq('event_id', eventId);

    if (error) {
      console.error('Error deleting event:', error.message);
    } else {
      console.log("Event deleted successfully:", data);
      await fetchEvents(); // Refresh the events list
    }
  }

  // Fetch events when the component is mounted
  onMount(() => {
    fetchEvents();
  });
</script>

<!-- HTML Template to display events -->
<div class="grid grid-cols-2 gap-6">
  <!-- Left side: Event List -->
  <div>
    <h2 class="text-xl font-semibold mb-4 text-center">Upcoming Events</h2>
    <ul class="list-none space-y-2">
      {#each events as event}
        <li class="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
          <div>
            <h3 class="font-semibold">{event.eventName}</h3>
            <p>{event.eventDescription}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Skills:</strong> {event.requiredSkills.join(', ')}</p>
            <p><strong>Urgency:</strong> {event.urgency}</p>
            <p><strong>Date:</strong> {event.eventDate}</p>
          </div>
          <button class="btn btn-error btn-sm" on:click={() => deleteEvent(event.event_id)}>Delete</button>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Right side: Event Form -->
  <div>
    <h2 class="text-xl font-semibold mb-4 text-center">Create New Event</h2>
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div class="form-control">
        <label class="label" for="eventName">
          <span class="label-text">Event Name (required)</span>
        </label>
        <input id="eventName" type="text" class="input input-bordered" bind:value={eventName} maxlength="100" required placeholder="Enter Event Name" />
      </div>
      <div class="form-control">
        <label class="label" for="eventDescription">
          <span class="label-text">Event Description (required)</span>
        </label>
        <textarea id="eventDescription" class="textarea textarea-bordered" bind:value={eventDescription} required placeholder="Enter Event Description"></textarea>
      </div>
      <div class="form-control">
        <label class="label" for="location">
          <span class="label-text">Location (required)</span>
        </label>
        <textarea id="location" class="textarea textarea-bordered" bind:value={location} required placeholder="Enter Location"></textarea>
      </div>
      <div class="form-control">
        <label class="label" for="requiredSkills">
          <span class="label-text">Required Skills (Multi-select, required)</span>
        </label>
        <select id="requiredSkills" class="select select-bordered" bind:value={requiredSkills} multiple required>
          {#each skillsOptions as skill}
            <option value={skill}>{skill}</option>
          {/each}
        </select>
      </div>
      <div class="form-control">
        <label class="label" for="urgency">
          <span class="label-text">Urgency (required)</span>
        </label>
        <select id="urgency" class="select select-bordered" bind:value={urgency} required>
          {#each urgencyOptions as level}
            <option value={level}>{level}</option>
          {/each}
        </select>
      </div>
      <div class="form-control">
        <label class="label" for="eventDate">
          <span class="label-text">Event Date (required)</span>
        </label>
        <input id="eventDate" type="date" class="input input-bordered" bind:value={eventDate} required />
      </div>
      <div class="form-control mt-6">
        <button class="btn btn-primary" type="submit">Submit Event</button>
      </div>
    </form>
  </div>
</div>