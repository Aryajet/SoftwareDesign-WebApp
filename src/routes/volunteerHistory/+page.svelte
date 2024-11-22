<script>
	import { supabase } from "$lib/supabaseClient";

  // Reactive variables
  let eventHistory2 = [];
  let nameFilter = '';
  let eventFilter = '';

  // Fetch data from Supabase
  async function fetchEvents() {
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    // Map Supabase data to match UI expectations
    eventHistory2 = data.map(event => ({
      id: event.event_id,
      name: 'Unknown', // Placeholder, replace with actual user data if needed
      event: event.event_name,
      description: event.description,
      date: event.date,
      urgency: event.urgency,
      skills: [event.required_skill1, event.required_skill2, event.required_skill3].filter(Boolean),
      location: event.location,
      participation: 'Unknown', // Placeholder
      performance: null // Placeholder
    }));
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
</script>

<h2 class="text-xl font-semibold mb-4 text-center">Volunteer History</h2>
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
