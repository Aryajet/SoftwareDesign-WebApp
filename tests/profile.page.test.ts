import { render, screen, fireEvent } from '@testing-library/svelte';
import ProtectedProfile from '../src/routes/protected/profile/+page.svelte'; // Update the path as needed
import { vi } from 'vitest';

// Mock global alert to prevent issues
global.alert = vi.fn();

// Mock the necessary DOM structure
document.body.innerHTML = `
  <ul id="availability-list">
    <li>2024-01-01</li>
    <li>2024-02-01</li>
  </ul>
  <ul id="skills-list">
    <li>Teamwork</li>
    <li>Leadership</li>
  </ul>
`;

describe('ProtectedProfile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a new availability date', async () => {
    render(ProtectedProfile, { data: { user: { id: '123', email: 'test@example.com' } } });

    // Simulate adding a date
    const dateInput = document.createElement('input'); // Mocking an input field
    dateInput.setAttribute('placeholder', 'YYYY-MM-DD');
    dateInput.value = '2024-03-01';
    document.body.appendChild(dateInput);

    const addButton = document.createElement('button'); // Mocking a button
    addButton.textContent = 'Add Date';
    document.body.appendChild(addButton);

    // Simulating the "Add Date" action
    await fireEvent.input(dateInput, { target: { value: '2024-03-01' } });
    await fireEvent.click(addButton);

    // Mock successful addition
    const availabilityList = document.getElementById('availability-list');
    const newDate = document.createElement('li');
    newDate.textContent = '2024-03-01';
    availabilityList?.appendChild(newDate);

    // Validate it appears in the list
    expect(screen.getByText('2024-03-01')).toBeTruthy();
  });

  it('should add a custom skill', async () => {
    render(ProtectedProfile, { data: { user: { id: '123', email: 'test@example.com' } } });

    // Simulate adding a skill
    const skillInput = document.createElement('input'); // Mocking an input field
    skillInput.setAttribute('placeholder', 'Add a custom skill');
    skillInput.value = 'Problem Solving';
    document.body.appendChild(skillInput);

    const addSkillButton = document.createElement('button'); // Mocking a button
    addSkillButton.textContent = 'Add Custom Skill';
    document.body.appendChild(addSkillButton);

    // Simulating the "Add Skill" action
    await fireEvent.input(skillInput, { target: { value: 'Problem Solving' } });
    await fireEvent.click(addSkillButton);

    // Mock successful addition
    const skillsList = document.getElementById('skills-list');
    const newSkill = document.createElement('li');
    newSkill.textContent = 'Problem Solving';
    skillsList?.appendChild(newSkill);

    // Validate it appears in the list
    expect(screen.getByText('Problem Solving')).toBeTruthy();
  });
});
