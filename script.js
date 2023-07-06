// Load the messages asynchronously from the CSV file
async function loadMessages() {
  try {
    const response = await fetch('messages1.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const csvData = await response.text();
    const messages = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

    // Generate a random index to select a message
    const randomIndex = Math.floor(Math.random() * messages.length);
    const selectedMessage = messages[randomIndex]?.message;

    if (selectedMessage) {
      document.getElementById("message").textContent = selectedMessage;
    } else {
      throw new Error("No message selected");
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Call the loadMessages function when the HTML content is fully loaded
document.addEventListener('DOMContentLoaded', loadMessages);
