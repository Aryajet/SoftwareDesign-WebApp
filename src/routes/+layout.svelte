<script lang="ts">
    import type { LayoutData } from './$types';
    import "tailwindcss/tailwind.css";
</script>

<div class="navbar bg-base-100">
    <div class="navbar-start">
        <div class="dropdown">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </div>
            <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li><a href="">Empty</a></li>
            </ul>
        </div>
    </div>

    <!-- Add buttons for login, user profile, and volunteer matching directly in the navbar -->
    <div class="navbar-center flex space-x-4">
        <a href="/" class="btn btn-ghost">Home</a>
        <a href="/login" class="btn btn-ghost">Login</a>
        <a href="/login/userprofile" class="btn btn-ghost">User Profile Management</a>
        <a href="/volunteermatching" class="btn btn-ghost">Volunteer Matching</a>
        <a href="/volunteerHistory" class="btn btn-ghost">Volunteer History</a>
        <a href="/eventManagement" class="btn btn-ghost">Event Management</a>
        <a href="/notificationSystem" class="btn btn-ghost">Notification System</a>
    </div>

    <div class="navbar-end">
        <button class="btn btn-ghost btn-circle">
            <div class="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span class="badge badge-xs badge-primary indicator-item"></span>
            </div>
        </button>
    </div>
</div>

<slot />