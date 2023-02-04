import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

// config openai with api key
dotenv.config({
  // path: '../.env'
});


const configuration = new Configuration({
  // apiKey: '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',
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// config express
const app = express();
app.use(cors());  // this is going to allow us to make the cross origin requests and allow the server to be called from the fontend
app.use(express.json()); // use to pass json from the frontend to the backend

// create a dummy root route
// get route you cant really receive a lot of data from the front end
app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Codux!',
  });

});

// the post route allows us to ha ve a body or a payload 
app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    // this function accepts object
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0,
      /**
       * A high temperature value will result in the model generating more diverse and unpredictable outputs,
       * while a low temperature value will make the model's outputs more predictable and likely to conform to its training data
       * In practice, the temperature value is used as a hyperparameter in machine learning algorithms,
       * and can be adjusted to strike a balanc e between creativity and accuracy in the model's outputs.
       * 如果温度值设得较高，生成的文本将更具随机性，可能出现更多不一定相关的内容；如果温度值设得较低，生成的文本将更加保守，偏向于原有的内容。
       */
      max_tokens: 4000,
      // maximum tokens to generate in a completion, default=64, here set it to 3000, this way it means it can give pretty long responses
      /**
       *  there is a limit to the maximum number of tokens you can use in OpenAI's GPT-3 model.
       * The exact limit depends on the specific use case and the available computational resources.
       * In general, using more tokens will result in more accurate and nuanced results,
       * but will also require more computational resources and may be slower to generate.
       */
      top_p: 1,
      frequency_penalty: 0.5,  // means its not going to repeat simiar sentences often, defalut=0, we set to 0.5, so when it says something and you ask it a similar question, it it less likely to say a simiar thing
      presence_penalty: 0,
      //stop=["\"\"\""] //we don't need a stop in this case
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});



app.listen(3000, () => console.log('Server is running on port http://localhost:3000'));
