/**
 * Example snippet to fetch and render dynamic company insights from the newly built scraping API.
 */

async function fetchDynamicCompanyInsights(companyName) {
  try {
    console.log(`Fetching live insights for ${companyName}... This may take 10-15s if scraping...`);
    
    const response = await fetch(`/api/company-insights/${encodeURIComponent(companyName)}`);
    const data = await response.json();

    if (!data.success) {
      console.error('Failed to get insights:', data.message);
      return;
    }

    console.log(`✅ Insights loaded for ${data.company} (Cached: ${data.cached})`);
    
    // Example: Rendering Hiring Rounds
    const roundsList = document.getElementById('rounds-container');
    if (roundsList) {
      roundsList.innerHTML = data.hiringRounds.map(round => `<li>${round}</li>`).join('');
    }

    // Example: Rendering Overall Difficulty
    const diffNode = document.getElementById('meta-difficulty');
    if (diffNode) {
      diffNode.textContent = `Difficulty: ${data.summary.overallDifficulty}`;
    }

    // Example: Rendering specific real experiences
    const xpContainer = document.getElementById('experiences-container');
    if (xpContainer && data.experiences.length > 0) {
      xpContainer.innerHTML = data.experiences.map(xp => `
        <div class="experience-card">
          <h4>${xp.role} (${xp.year}) - ${xp.source}</h4>
          <p><strong>Difficulty:</strong> ${xp.difficulty}</p>
          <p><strong>Real Questions Asked:</strong></p>
          <ul>${xp.questions.map(q => `<li>${q}</li>`).join('')}</ul>
          <p><strong>Tips:</strong></p>
          <ul>${xp.tips.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Error fetching live insights:', err);
  }
}

// Example Execution
// fetchDynamicCompanyInsights('Amazon');
