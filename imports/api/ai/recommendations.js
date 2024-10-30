import OpenAI from 'openai';
import { Meteor } from 'meteor/meteor';
import { Books } from '../books/books';

const openai = new OpenAI({
  apiKey: Meteor.settings.private.openai.apiKey
});

const getGoogleBookData = async (title, author) => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title + ' ' + author)}`
  );
  const data = await response.json();
  const book = data.items?.[0];
  return book?.volumeInfo?.imageLinks?.thumbnail || '';
};

export const generateRecommendations = async (book) => {
  console.log('Starting AI recommendations for:', book.title);
  
  try {
    const prompt = `Given the book "${book.title}" by ${book.author}, which is about: ${book.description} suggest between 1 and 5 RELATED books, which could be considered further reading.

Consider themes, writing style, and subject matter. Focus on books that share meaningful connections with "${book.title}" and EXPAND upon the topics covered in the original. For instance, for a book about the opioid crisis you might recommend another about the origins of opium. Only include books you're confident are strong recommendations

Important guidelines:
    - Only include books you're confident are strong recommendations
    - Focus on quality matches over quantity
    - Consider themes, writing style, and subject matter
    - Each recommendation should have a clear connection to "${book.title}"
    - Do NOT recommend "${book.title}"
    
    For each book, provide:
    1. The title
    2. The author
    3. A specific reason why this book connects to "${book.title}"
    
    Return ONLY a JSON object with no markdown or other formatting, like this:
    {
      "recommendations": [
        {
          "title": "Book Title",
          "author": "Author Name",
          "reason": "Specific explanation of the connection"
        }
      ]
    }`;

    console.log('Sending prompt to OpenAI');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a knowledgeable librarian who provides between 1 and 5 thoughtful 'further reaading' recommendations." 
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
    let cleanedResponse = aiResponse.trim();
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!parsed.recommendations || 
          !Array.isArray(parsed.recommendations) || 
          parsed.recommendations.length === 0 || 
          parsed.recommendations.length > 5) {
        throw new Error('Invalid recommendation structure - must have 1-5 recommendations');
      }
      
      // Process each recommendation
      const aiRecommendations = await Promise.all(parsed.recommendations.map(async (rec) => {
        const thumbnail = await getGoogleBookData(rec.title, rec.author);
        
        // Create a book record for the recommendation with the correct title and author
        const bookData = {
          googleId: `ai_${Date.now()}_${Math.random()}`,
          title: rec.title,
          author: rec.author,
          thumbnail,
          description: '',
          publishedDate: ''
        };

        const bookId = await Meteor.callAsync('books.createFromGoogle', bookData);

        const recommendation = {
          bookId,
          title: rec.title,
          author: rec.author,
          thumbnail,
          recommendedBy: {
            type: 'ai'
          },
          reason: rec.reason,
          createdAt: new Date()
        };

        const recommendedFor = {
          bookId: book._id,
          recommendedBy: {
            type: 'ai'
          },
          reason: rec.reason,
          createdAt: new Date()
        };

        // Add to source book's recommendations
        await Books.updateAsync(book._id, {
          $push: { recommendations: recommendation }
        });

        // Add to recommended book's recommendedFor
        await Books.updateAsync(bookId, {
          $push: { recommendedFor: recommendedFor }
        });

        return recommendation;
      }));

      return aiRecommendations;

    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Failed to parse:', cleanedResponse);
      
      return [{
        bookId: null,
        recommendedBy: {
          type: 'ai'
        },
        reason: "Error processing AI response",
        createdAt: new Date()
      }];
    }
  } catch (error) {
    console.error('Error in generateRecommendations:', error);
    return [{
      bookId: null,
      recommendedBy: {
        type: 'ai'
      },
      reason: "Error contacting AI service",
      createdAt: new Date()
    }];
  }
}; 