<script lang="ts">
    import type { PageData } from '../signin/$types';
    export let data: PageData;
</script>
<div class="flex flex-col w-full max-w-xs mx-auto mt-8">
    <p class="text-lg font-semibold mb-4">Register</p>
  
    <div class="form-control mb-4">
      <label for="user" class="label">
        <span class="label-text">Email</span>
      </label>
      <input type="text" id="user" name="user" placeholder="Enter your email" class="input input-bordered w-full" />
    </div>
  
    <div class="form-control mb-4">
      <label for="pass" class="label">
        <span class="label-text">Password</span>
      </label>
      <input type="password" id="pass" name="pass" placeholder="Enter new password" class="input input-bordered w-full" />
    </div>
  
    <div class="form-control mb-6">
      <button class="btn btn-primary w-full">Create Account</button>
    </div>
  
    <div class="form-control">
      <button class="btn btn-secondary w-full">Log In</button>
    </div>
  </div>
  