<script lang="ts">
  import type { LayoutData } from './$types';
  import "tailwindcss/tailwind.css";
  import { goto, invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  export let data: LayoutData;
  let { user, supabase, session } = data;

  $: user = session?.user || null;

  // Check auth state changes
  onMount(() => {
    const { subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        session = newSession;
        user = newSession?.user || null;
        invalidate('supabase:auth');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  });

  $: isSignedIn = !!user;

  async function signOut() {
      const { error } = await supabase.auth.signOut();
      if (!error) {
          user = null;
          goto('/');
      }
      console.log(error);
  }
</script>

{#if isSignedIn}
<!-- Navbar will only show if the user is signed in -->
<div class="navbar bg-base-200">
  <div class="navbar-start"></div>
  <div class="navbar-center flex space-x-4">
      <!-- <a href="/" class="btn btn-ghost">Home</a> -->
      <a href="/protected/profile" class="btn btn-ghost">Profile</a>
      <a on:click={signOut} class="btn btn-ghost">LogOut</a>
      <a href="/matching" class="btn btn-ghost">Matching</a>
      <a href="/volunteerHistory" class="btn btn-ghost">Volunteer History</a>
      <a href="/eventManagement" class="btn btn-ghost">Event Management</a>
      <a href="/notificationSystem" class="btn btn-ghost">Notification System</a>
      <a href="/createFile" class="btn btn-ghost">File Creator</a>
  </div>
  <div class="navbar-end"></div>
</div>
{/if}

<!-- The rest of the page content -->
<slot />
