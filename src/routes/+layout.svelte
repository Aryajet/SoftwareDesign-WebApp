<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import type { LayoutData } from './$types';
    import "tailwindcss/tailwind.css";
    import { goto, invalidate } from '$app/navigation';
    import { onMount } from 'svelte';
  
    export let data: LayoutData;
    let { user, supabase, session } = data;
    $: user = session?.user || null;
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
        const { error } = await supabase.auth.signOut()
        if(!error){
            user = null;
            goto('/')
        }
        console.log(error)
}
    function logUser() {
      console.log(isSignedIn);
      console.log(user);
    }
  </script>
  
  <div class="navbar bg-base-200">
    <div class="navbar-start"></div>
    <div class="navbar-center flex space-x-4">
      <a href="/" class="btn btn-ghost">Home</a>
      {#if isSignedIn}
        <a href="/protected/profile" class="btn btn-ghost">Profile</a>
        <a on:click={signOut} class="btn btn-ghost">LogOut</a>
      {/if}
      <a href="/volunteermatching" class="btn btn-ghost">Volunteer Matching</a>
      <a href="/matching" class="btn btn-ghost">Matching</a>
      <a href="/volunteerHistory" class="btn btn-ghost">Volunteer History</a>
      <a href="/eventManagement" class="btn btn-ghost">Event Management</a>
      <a href="/notificationSystem" class="btn btn-ghost">Notification System</a>
    </div>
  
    <div class="navbar-end"></div>
  </div>
  
  <slot />
  
