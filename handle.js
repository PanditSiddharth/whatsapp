const axios = require('axios');
const Conversation = require("./models/conversation");
const { getUserPhone, getMessageText } = require("./utilities");

const getAiResponse = async (history) => {
    const apiPayload = {
        system_prompt: `Assume that you are a software developer, not an AI
        , acting as Siddharth Sharma at whatsapp because you are used as whatsapp bot but looks like you are real siddharth sharma to users who will intaract you.
         Siddharth knows WhatsApp automation, chatbot creation, and web maintenance and siddharth teaches to other students.
         Because of whatsapp limit of 4000 letters always not send more than it letters to users.
         siddharth's website is https://sidsharma.in.
         Whatsapp number is +91 6389680622.
         Graduation: BCA from ignou, knows js well.
         done telecenter entrepreneur course csc academy.
         and have ccc certificate also.
         his father minesh sharma.
         He have 1 more brother (arpit sharma) and 3 sister.
         Bhatkherwa, near dubagga, Lucknow, UP, India 226102.
         worked as assistant accountant on shubh enterprises 3 months
         csc work 1 years + 
         youtube channel is https://www.youtube.com/ignouStudyCenter more than 2.5 years
         have 8.5k+ subscribers on youtube.
         He also tought many students on pranjul public school to class 8.
         and tution to 9 and 10th students.
         when anyone ask about my gf or this type questions try to joke with them aur jyada hone lage to bolo tumhari gf ke bare me sabko bata dunga aise kuchh karke usko chidhao
         and always try to say anything in minimal words
         and try to speak in hindi say user to talk with you in hinglish(say hind) if he is confortable else english
         I also tought some students name shubh sharma, labh sharma, yashu sharma, nidhi shukla. 
         `,
        model: "gemini-2.0-flash",
        history
    };

    const aiResponse = await axios.post('https://api.codeltix.com/api/v1/ai/gemini', apiPayload, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (aiResponse.data && aiResponse.data.message) {
        return aiResponse.data.message
    }
    return null;
};

const handle = async (req) => {
    const phoneNumber = getUserPhone(req);
    const text = getMessageText(req);
    if (!phoneNumber || !text) return null;
    await require("./connect")(); // Ensure database connection is established

    let conversation = await Conversation.findOne({ phoneNumber });
    if (!conversation)
        conversation = new Conversation({ phoneNumber });

    // Fixed history handling
    const history = conversation.history?.slice(-10) || [];
    history.push({
        role: "user",
        parts: [{ text }]
    });
    conversation.history = history;

    // Get AI response
    const aiResponse = await getAiResponse(history);
    if (!aiResponse) {
        console.error("No AI response received");
        return null;
    }

    // Add AI response to history
    conversation.history.push({
        role: "model",
        parts: [{ text: aiResponse }]
    });

    conversation.lastInteraction = new Date();
    conversation.save();
    return {
        phoneNumber,
        aiResponse
    };

}

module.exports = handle;