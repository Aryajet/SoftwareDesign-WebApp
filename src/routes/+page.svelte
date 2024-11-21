<!-- src/routes/+page.svelte -->
<script lang="ts">
    import "tailwindcss/tailwind.css";
    import { supabase } from "$lib/supabaseClient";
    import { goto } from "$app/navigation";
  
    let email = '';
    let password = '';
    async function signInWithEmail() {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
  
        if (error) {
          console.error('Sign-in error:', error.message);
        } else {
          console.log('Sign-in successful:', data);
          if (data) {
            goto('/protected/profile');
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
    async function signUpWithEmail() {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
  
        if (error) {
          console.error('Sign-up error:', error.message);
        } else {
          console.log('Sign-up successful:', data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
      goto('/protected/profile')
    }
    async function signOut() {
        const { error } = await supabase.auth.signOut()
        console.log(error)
}

  </script>
  
  <body>
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
          <div class="card-actions justify-end">
            <button class="btn btn-primary w-full" on:click={signUpWithEmail}>Sign Up</button>
          </div>
          <div class="card-actions justify-end">
            <button class="btn btn-primary w-full" on:click={signInWithEmail}>Login</button>
          </div>
        </div>
      </div>
    </div>
  </body>
  
