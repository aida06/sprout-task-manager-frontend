<template>
  <div class="help-content">
    <h1>Welcome to Sprout!</h1>
    <p>Sprout helps you grow your self-discipline, like a seed turning into a plant. Our goal is to support you in forming habits that help you thrive! 😊 </p>

    <h2>Our Key Features</h2>
    <ul>
      <li><strong>📝 Task Management:</strong> Organize your tasks and prioritize them to maximize your productivity.</li>
      <li><strong>⏳ Focus Timer:</strong> Stay focused with a Pomodoro-style timer, helping you manage work and breaks.</li>
      <li><strong>🌱 Sprout Island:</strong> Earn rewards by completing tasks, and use them to personalize your island with fun items!</li>
      <li><strong>📅 Schedule:</strong> Plan your day, week, or month with our interactive calendar to stay on track.</li>
      <li><strong>📊 Data Dashboard:</strong> Track your productivity and view your progress over time.</li>
      <li><strong>🎖️ Badges:</strong>  Earn badges as you hit your milestones and watch your progress grow!</li>
      <li><strong>🤖 AI Chatbot:</strong> Get help and suggestions to stay on top of your tasks and goals.</li>
    </ul>

    <h2>Common Questions</h2>
    <div class="faq">
      <p><strong>How do I manage my tasks in the Task Management section?</strong><br />
        In the Task Management page, you can create new tasks, set priorities, and categorize them with tags. You can also receive reward coins for completing tasks.</p>

      <p><strong>How are reward coins calculated?</strong><br />
        Reward coins are calculated based on the importance and urgency of your tasks, using the following formula: <br />
        <code>RewardCoins = 0.6 * Importance + 0.4 * Urgency + 5</code><br />
        The higher the importance and urgency, the more reward Coins you receive. The task with the most reward coins having the highest priority.</p>

      <p><strong>What can I do with the Focus Timer?</strong><br />
        With the Focus Timer, you can customize the background and ambient sound to create a relaxing atmosphere, pause the timer if needed, or give up the session without earning rewards.</p>


      <p><strong>What can I do with the Sprout Island?</strong><br />
        Sprout Island is a gamified space where you can use reward coins to buy items to personalize your island. You can also move items and sell them to get half of coins back!</p>


      <p><strong>Can I track my task progress over time?</strong><br />
        Yes! The Data Dashboard feature allows you to monitor your task completion and focus time over any selected period (daily, weekly, monthly).</p>


      <p><strong>How can I plan my day or week?</strong><br />
        You can use the Schedule feature to create and manage events for the day, week, or month. It helps you stay organized and on track with your tasks.</p>

      <p><strong>How can I use the AI Chatbot?</strong><br />
        The AI Chatbot can assist you in several ways:
        <ul>
          <li>Schedule Guidance: Get suggestions on how to plan your tasks, like “What’s the best time for focused work?”</li>
          <li>Data Analysis: Review your productivity and task completion through uploading generated reports.</li>
          <li>General Questions: Ask general queries such as “What’s the weather today?” or “Give me a motivational quote.”</li>
        </ul>
      </p>

      <p><strong>How do I get help if I need it?</strong><br />
        You can always ask the AI Chatbot for assistance, or visit the Help section for more detailed instructions. Additionally, feel free to provide feedback below to help us improve!</p>
    </div>

    <h2>Give Feedback</h2>
    <p>Please feel free to give us your feedback, we truly appreciate it!</p>

    <div>
      <textarea v-model="feedbackText" placeholder="Write your feedback here..." rows="4" cols="50"></textarea>
    </div>
    <div class="button-container">
      <button @click="sendFeedback">Send Feedback</button>
    </div>
  </div>

</template>


<script>
import { ElMessage } from 'element-plus';
import emailjs from 'emailjs-com';


export default {
  name: "Help",
  data() {
    return {
      feedbackText: "",
    };
  },
  methods: {
    // Method to send feedback to the specified email using EmailJS
    sendFeedback() {
      // Check if the feedback is empty
      if (this.feedbackText.trim() === "") {
        ElMessage.error("Please enter some feedback before submitting.");  // Display error if empty
        return;
      }

      // Set up the email parameters
      const emailParams = {
        to_email: 'aida111106@gmail.com',
        message: this.feedbackText,
      };

      // Send the email via EmailJS
      emailjs.send('service_8tmg7fq', 'template_5g2lskc', emailParams, 'jXtdyuCB00qMlqpcD')
          .then((response) => {
            // On success, show a success message
            ElMessage.success("Thank you for your feedback!");
            console.log('Feedback sent successfully:', response);
            // Clear the feedback input after sending
            this.feedbackText = "";
          })
          .catch((error) => {
            // If an error occurs, show an error message
            ElMessage.error("There was an issue sending your feedback. Please try again.");
            console.log('Error:', error);
          });
    },
  },
};
</script>


<style scoped>
textarea {
  background: white;   /* rgb(241, 248, 233, 0.3)*/
  font-family: 'Segoe UI', sans-serif;
  width: 600px;
  height: 150px;
  padding: 10px;
  margin-top: 10px;
  font-size: 14px;
  border: 2px solid #DCEDC8;
  border-radius: 5px;
}


.button-container {
  display: flex;
  justify-content: flex-end;
  width: 37%;
  margin-top: 10px;
  margin-bottom: 100px;
}

button {
  font-family: 'Segoe UI', sans-serif;
  padding: 10px 20px;
  background-color: #4E6B50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #3b5b3f;
}

.help-content {
  background: #F9FBF7;
  font-family: 'Segoe UI', sans-serif;
  color: #4E6B50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: left; /* Align text to the left  rgb(241, 248, 233, 0.3)*/
  padding-top: 30px; /* Adjust this value to control the space from the top */
  width: 100%;
}


ul {
  padding-left: 20px; /* Add space to align the list items nicely */
}

ul li {
  margin-bottom: 10px; /* Space between the list items */
}

.faq {
  margin-top: 15px;
  text-align: left;
  line-height: 1.6;
}

.faq p {
  margin-bottom: 10px;
}

.faq strong {
  font-weight: bold;
}

</style>