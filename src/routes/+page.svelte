<script lang="ts">
  import "tailwindcss/tailwind.css";
  import { supabase } from "$lib/supabaseClient";
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  export let data: PageData;
  let { user } = data;
  let email = '';
  let password = '';
  let errorMessage = ''; // For displaying error messages

  async function signInWithEmail() {
    errorMessage = ''; // Clear previous errors

    if (!email || !password) {
      errorMessage = 'Email and password cannot be empty.';
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error.message);
        errorMessage = 'Invalid email or password. Please try again.';
      } else {
        console.log('Sign-in successful:', data);
        goto('/protected/profile');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }

  async function signUpWithEmail() {
    errorMessage = ''; // Clear previous errors

    // Validate email and password
    if (!email || !email.includes('@')) {
      errorMessage = 'Please provide a valid email.';
      return;
    }
    if (!password || password.length < 6) {
      errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign-up error:', error.message);
        errorMessage = error.message; // Show the error message from Supabase
      } else {
        console.log('Sign-up successful:', data);
        goto('/protected/profile');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      errorMessage = 'An unexpected error occurred. Please try again.';
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    console.log(error);
  }

  $: status = !!user?.id;
</script>

<body>
  {#if status}
    <div>You are Signed In!</div>
  {:else}
    <div class="flex justify-center">
      <div class="card w-96 bg-base-100 shadow-xl mt-20 mb-20">
        <div class="card-body">
          <h2 class="card-title">Login!</h2>
          <div class="items-center mt-2">
            <label class="input input-bordered flex items-center gap-2 mb-2">
              <input type="text" class="grow" placeholder="Email" bind:value={email} />
            </label>
            <label class="input input-bordered flex items-center gap-2 mb-2">
              <input type="password" class="grow" placeholder="Password" bind:value={password} />
            </label>
          </div>
          {#if errorMessage}
            <div class="text-red-500 text-sm mb-4">{errorMessage}</div>
          {/if}
          <div class="card-actions justify-end">
            <button class="btn btn-primary w-full" on:click={signUpWithEmail}>Sign Up</button>
          </div>
          <div class="card-actions justify-end">
            <button class="btn btn-primary w-full" on:click={signInWithEmail}>Login</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</body>