<script lang="ts">
    import { supabase } from '$lib/supabaseClient';

    interface Event {
        event_id: number;
        event_name: string;
        description: string | null;
        location: string | null;
        required_skill1: string | null;
        required_skill2: string | null;
        required_skill3: string | null;
        date: string | null;
        urgency: string | null;
        volunteers: string[] | null;
    }

    interface Volunteer {
        id: string;
        full_name: string | null;
        location: string | null;
        availability: string[] | null;
        skills: string[] | null;
    }

    let userRole: 'Volunteer' | 'Organizer' | '' = '';
    let events: Event[] = [];
    let filteredEvents: Event[] = [];
    let userId: string | null = null;
    let userSkills: string[] = [];
    let matchedVolunteers: Volunteer[] = [];
    let selectedEvent: Event | null = null;
    let selectedVolunteerIds: Set<string> = new Set();
    let isLoading = true;


    async function fetchUserProfile() {
        const { data: user, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error fetching user:', error.message);
            return;
        }

        if (user) {
            userId = user.user?.id || null;

            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('role, skills')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error('Error fetching user profile:', profileError.message);
                return;
            }

            userRole = profileError ? '' : (data.role as 'Volunteer' | 'Organizer');
            userSkills = data.skills || [];
        }
    }

    async function fetchEvents() {
        const { data, error } = await supabase
            .from('Event_Table')
            .select(
                `event_id, 
                event_name, 
                description, 
                location, 
                required_skill1, 
                required_skill2, 
                required_skill3, 
                date, 
                urgency, 
                volunteers`
            )
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error.message);
            return;
        }

        events = data as Event[];
        filterEventsBySkills();
    }

    function filterEventsBySkills() {
        filteredEvents = events.filter(event => {
            const eventSkills = [event.required_skill1, event.required_skill2, event.required_skill3].filter(Boolean);
            return (
                eventSkills.length === 0 ||
                eventSkills.some(skill => userSkills.includes(skill!))
            );
        });
    }

    async function fetchVolunteersForEvent(event: Event) {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, location, availability, skills');
        if (error) {
            console.error('Error fetching volunteers:', error.message);
            return;
        }
        const eventSkills = [event.required_skill1, event.required_skill2, event.required_skill3].filter(Boolean);
        const eventDate = event.date;
        matchedVolunteers = (data as Volunteer[]).filter(volunteer => {
            const hasRequiredSkills = eventSkills.every(skill => volunteer.skills?.includes(skill!));
            const isAvailable = volunteer.availability?.includes(eventDate!);
            return hasRequiredSkills && isAvailable;
        });
        selectedVolunteerIds = new Set(event.volunteers || []);
    }


    async function joinEvent(event: Event) {
        if (!userId) return;
        const updatedVolunteers = [...(event.volunteers || []), userId];
        const { error } = await supabase
            .from('Event_Table')
            .update({ volunteers: updatedVolunteers })
            .eq('event_id', event.event_id);
        if (error) {
            console.error('Error joining event:', error.message);
            return;
        }
        event.volunteers = updatedVolunteers;
        filteredEvents = [...filteredEvents];
    }


    async function leaveEvent(event: Event) {
        if (!userId) return;
        const updatedVolunteers = (event.volunteers || []).filter(id => id !== userId);
        const { error } = await supabase
            .from('Event_Table')
            .update({ volunteers: updatedVolunteers })
            .eq('event_id', event.event_id);
        if (error) {
            console.error('Error leaving event:', error.message);
            return;
        }
        event.volunteers = updatedVolunteers;
        filteredEvents = [...filteredEvents];
    }


    async function initialize() {
        await fetchUserProfile();
        await fetchEvents();
        isLoading = false;
    }

    initialize();
</script>

<div class="flex flex-col w-full max-w-4xl mx-auto mt-8 p-4">
    {#if isLoading}
        <div class="flex justify-center items-center h-48">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
    {:else if userRole === 'Organizer'}
        <h1 class="text-2xl font-bold mb-4">Manage Volunteers for Events</h1>
        <div class="form-control w-full mb-4">
            <label class="label">
                <span class="label-text">Select Event</span>
            </label>
            <select class="select select-bordered" bind:value={selectedEvent} on:change={() => selectedEvent && fetchVolunteersForEvent(selectedEvent)}>
                <option disabled selected>Select an event</option>
                {#each events as event}
                    <option value={event}>{event.event_name} - {event.date}</option>
                {/each}
            </select>
        </div>
        {#if selectedEvent}
            <div class="overflow-x-auto">
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Volunteer ID</th>
                            <th>Full Name</th>
                            <th>Location</th>
                            <th>Skills</th>
                            <th>Availability</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each matchedVolunteers as volunteer}
                            <tr>
                                <td>{volunteer.id}</td>
                                <td>{volunteer.full_name}</td>
                                <td>{volunteer.location}</td>
                                <td>{volunteer.skills?.join(', ')}</td>
                                <td>{volunteer.availability?.join(', ')}</td>
                                <td>
                                    {#if selectedVolunteerIds.has(volunteer.id)}
                                        <button class="btn btn-error btn-xs" on:click={() => removeVolunteerFromEvent(volunteer.id)}>
                                            Remove
                                        </button>
                                    {:else}
                                        <button class="btn btn-primary btn-xs" on:click={() => addVolunteerToEvent(volunteer.id)}>
                                            Add
                                        </button>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {:else}
            <p class="text-gray-500 mt-4">Select an event to manage volunteers.</p>
        {/if}
    {:else if userRole === 'Volunteer'}
    <h1 class="text-2xl font-bold mb-4">Matched Events</h1>
    <div class="overflow-x-auto">
        <table class="table w-full">
            <thead>
                <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Required Skills</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredEvents as event}
                    <tr>
                        <td>{event.event_id}</td>
                        <td>{event.event_name}</td>
                        <td>{event.description}</td>
                        <td>{event.location}</td>
                        <td>{event.date}</td>
                        <td>
                            {#if event.required_skill1}{event.required_skill1}{/if}
                            {#if event.required_skill2}, {event.required_skill2}{/if}
                            {#if event.required_skill3}, {event.required_skill3}{/if}
                        </td>
                        <td>
                            {#if event.volunteers && userId && event.volunteers.includes(userId)}
                                <button class="btn btn-error btn-xs" on:click={() => leaveEvent(event)}>
                                    Leave
                                </button>
                            {:else}
                                <button class="btn btn-primary btn-xs" on:click={() => joinEvent(event)}>
                                    Join
                                </button>
                            {/if}
                        </td>
                        
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    {/if}
</div>
