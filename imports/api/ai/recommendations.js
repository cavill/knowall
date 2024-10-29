import OpenAI from 'openai';
import { Meteor } from 'meteor/meteor';

const openai = new OpenAI({
  apiKey: Meteor.settings.private.openai.apiKey
});

export const generateRecommendations = async (book) => {
  console.log('Starting AI recommendations for:', book.title);
  
  try {
    const prompt = `Based on the book "${book.title}" by ${book.author}, which is about: ${book.description}
    Please recommend:
    1. Three similar books that readers might enjoy
    2. Two movies or TV shows that have a similar theme or style
    3. One podcast or audiobook that relates to this topic
    
    Format your response EXACTLY like this JSON structure:
    {
      "books": ["Book 1", "Book 2", "Book 3"],
      "visualMedia": ["Movie/Show 1", "Movie/Show 2"],
      "audio": ["Podcast/Audiobook"]
    }
    
    Ensure the response is valid JSON with no trailing commas.`;

    console.log('Sending prompt to OpenAI');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that always responds with valid JSON." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('Raw AI response:', aiResponse);

    // Clean the response before parsing
    const cleanedResponse = aiResponse.trim();
    
    try {
      const recommendations = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!recommendations.books || !Array.isArray(recommendations.books) ||
          !recommendations.visualMedia || !Array.isArray(recommendations.visualMedia) ||
          !recommendations.audio || !Array.isArray(recommendations.audio)) {
        throw new Error('Invalid recommendation structure');
      }
      
      return recommendations;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Failed to parse:', cleanedResponse);
      
      // Return a fallback structure
      return {
        books: ["Unable to generate book recommendations"],
        visualMedia: ["Unable to generate media recommendations"],
        audio: ["Unable to generate audio recommendations"]
      };
    }
  } catch (error) {
    console.error('Error in generateRecommendations:', error);
    // Instead of throwing, return fallback recommendations
    return {
      books: ["Unable to generate book recommendations"],
      visualMedia: ["Unable to generate media recommendations"],
      audio: ["Unable to generate audio recommendations"]
    };
  }
}; 