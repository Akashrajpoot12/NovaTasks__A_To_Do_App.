function suggestAI() {
  if (tasks.length === 0) {
    aiSuggestion.classList.add('hidden');
    return;
  }

  const categories = tasks.map(t => t.category);
  const counts = {};
  categories.forEach(c => counts[c] = (counts[c] || 0) + 1);
  const topCat = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');

  aiText.textContent = `You're focused on ${topCat}. Want to add another ${topCat.toLowerCase()} task?`;
  aiSuggestion.classList.remove('hidden');
}