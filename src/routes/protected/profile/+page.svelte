<script lang="ts">
  import type { PageData } from './$types';
  import { supabase } from '$lib/supabaseClient';

  export let data: PageData;
  let { user } = data;

  // Variables for profile information
  let full_name = '';
  let first_name = '';
  let last_name = '';
  let username = '';
  let role: 'Volunteer' | 'Organizer' = 'User';
  let email = '';

  // Variables for availability
  let tempAvailabilityDates: string[] = [];
  let dateValue = '';

  // Variables for skills
  let uniqueSkills: string[] = [];
  let selectedSkills: string[] = [];
  let customSkill = '';
  let showDropdown = false;

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
        role = profile.role || 'User';
        email = user.user_metadata.email || '';
      }
    }
  }

  async function loadUniqueSkills() {
    const { data: skills, error } = await supabase
      .from('profiles')
      .select('skills');

    if (error) {
      console.error('Error loading unique skills:', error.message);
    } else if (skills) {
      uniqueSkills = [...new Set(skills.flatMap(profile => profile.skills || []))];
    }
  }

  async function updateProfile() {
    if (user) {
      full_name = `${first_name} ${last_name}`;
      const { error } = await supabase
        .from('profiles')
        .update({ first_name, last_name, full_name, username, availability: tempAvailabilityDates, skills: selectedSkills, role, email})
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error.message);
      } else {
        showDropdown = false;
        alert('Profile updated successfully!');
      }
    }
  }

  function addAvailabilityDate() {
    if (dateValue && !tempAvailabilityDates.includes(dateValue)) {
      tempAvailabilityDates = [...tempAvailabilityDates, dateValue];
      dateValue = '';
    }
  }

  function removeAvailabilityDate(dateToRemove: string) {
    tempAvailabilityDates = tempAvailabilityDates.filter(date => date !== dateToRemove);
  }

  function addCustomSkill() {
    if (customSkill && !selectedSkills.includes(customSkill)) {
      selectedSkills = [...selectedSkills, customSkill];
      if (!uniqueSkills.includes(customSkill)) {
        uniqueSkills = [...uniqueSkills, customSkill];
      }
      customSkill = '';
    }
  }

  loadProfile();
  loadUniqueSkills();
</script>

<div class="flex flex-col space-y-8 p-4">
  {#if user}
    <div>
      <h1 class="text-2xl font-bold mb-4">Welcome, {user.email}!</h1>
      <form on:submit|preventDefault={updateProfile} class="space-y-4">
        <div class="form-control">
          <label for="first_name" class="label">First Name:</label>
          <input id="first_name" type="text" bind:value={first_name} class="input input-bordered w-full" />
        </div>
        <div class="form-control">
          <label for="last_name" class="label">Last Name:</label>
          <input id="last_name" type="text" bind:value={last_name} class="input input-bordered w-full" />
        </div>
        <div class="form-control">
          <label for="username" class="label">Username:</label>
          <input id="username" type="text" bind:value={username} class="input input-bordered w-full" />
        </div>
        <div class="form-control">
          <label for="role" class="label">Role:</label>
          <select id="role" bind:value={role} class="select select-bordered w-full">
            <option value="Volunteer">Volunteer</option>
            <option value="Organizer">Organizer</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary w-full">Update Profile</button>
      </form>
    </div>
  {:else}
    <h1 class="text-2xl font-bold">Please log in to see your information.</h1>
  {/if}

  <div>
    <h2 class="text-xl font-semibold mb-4">Manage Your Availability</h2>
    <div class="form-control mb-4">
      <label for="availability" class="label"><strong>Availability:</strong></label>
      <ul class="space-y-2">
        {#each tempAvailabilityDates as date}
          <li class="flex justify-between items-center">
            {date} <button type="button" class="btn btn-xs btn-error" on:click={() => removeAvailabilityDate(date)}>Remove</button>
          </li>
        {/each}
      </ul>
      <div class="flex space-x-2 items-center mt-2">
        <input type="date" bind:value={dateValue} class="input input-bordered w-full" />
        <button class="btn" on:click={addAvailabilityDate}>Add Date</button>
      </div>
    </div>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-4">Manage Your Skills</h2>
    <div class="form-control mb-4 relative">
      <label for="skills" class="label"><strong>Skills:</strong></label>
      <button class="btn mb-2" on:click={() => showDropdown = !showDropdown}>Select Skills</button>
      {#if showDropdown}
        <div class="bg-white border rounded shadow mt-2 p-4 w-full space-y-2">
          {#each uniqueSkills as skill}
            <label class="flex items-center space-x-2">
              <input type="checkbox" bind:group={selectedSkills} value={skill} class="checkbox" />
              <span>{skill}</span>
            </label>
          {/each}
          <div class="mt-2">
            <input type="text" bind:value={customSkill} placeholder="Add a custom skill" class="input input-bordered w-full" />
            <button class="btn mt-2 w-full" on:click={addCustomSkill}>Add Custom Skill</button>
          </div>
          <button class="btn btn-success w-full mt-4" on:click={updateProfile}>Update Skills</button>
        </div>
      {/if}
    </div>
  </div>
</div>
