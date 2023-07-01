import express from "express"
import Joi from "joi";
import {MongoClient, ObjectId} from "mongodb"
import dotenv from "dotenv"
import dayjs from "dayjs";



const app = express()
app.use(express.json())
dotenv.config();

///conexão com o banco
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db

mongoClient.connect()
.then(() => db = mongoClient.db())
.catch((err) => console.log(err.message))

///dotenv
///importar coisas do mongo
//usar biblioteca mongodb

//Se conecte ao banco usando sempre a variável de ambiente DATABASE_URL. 
//Caso deixe o valor fixo ou use outra variável, a avaliação falhará.

//certo: const mongoClient = new MongoClient(process.env.DATABASE_URL);

//Não adicione nenhum nome customizado para o banco de dados. Use o nome dado pela 
//connection string.
//certo: const db = mongoClient.db();






//-------------------------------------------


// - [ ]  O formato de um **participante** deve ser:
//     ```jsx
//     {name: 'João', lastStatus: 12313123} // O conteúdo do lastStatus será explicado nos próximos requisitos
//     ```
 


// - [ ]  O formato de uma **mensagem** deve ser:

// {from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'}

//-------------------------------------------

// - [ ]  Salvar o participante na coleção de nome `participants` com o MongoDB, no formato:
    
//     ```jsx
//     {
//     		name: 'xxx',
//     		lastStatus: Date.now()
//     }
//     ```
    
//     - 🔥 **Dica**: este `Date.now()` gera um **timestamp**, que é o número de milissegundos passados desde 01/01/1970 00:00:00 até o exato momento. É bem útil pra fazer contas matemáticas com data e será útil nos próximos requisitos.
// - [ ]

//-------------------------------------------

// - [ ]  Salvar com o MongoDB uma mensagem na collection `messages` com o seguinte formato:
    
//     ```jsx
//     { 
//     		from: 'xxx',
//     		to: 'Todos',
//     		text: 'entra na sala...',
//     		type: 'status',
//     		time: 'HH:mm:ss'
//     }
//     ```
    
//     - `xxx` deve ser substituído pelo nome do usuário que acabou de entrar na sala.
//     - Para gerar o horário nesse formato, utilize a biblioteca `dayjs`.
// - [ ]  Por fim, em caso de sucesso, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status.


//// Para gerar o horário nesse formato, utilize a biblioteca dayjs. (HH:mm:ss')

const participants = [];
const messages = [];

const signUpSchema = Joi.object({
    name: Joi.string().required()
  });

  const messageSchema = Joi.object({
    to:  Joi.string().required(),
    text:  Joi.string().required(),
    type:  Joi.string().required()
  });

app.post("/participants", async (req,res) => {
    const {name} = req.body
    const currentTime = dayjs().format('HH:mm:ss');

    const { error } = signUpSchema.validate({name: name});

    if (error) {
        return res.status(422).send(error.details[0].message);
    }


    ///verificação se já existe no banco
    const newParticipant = {name,lastStatus: Date.now()}

    const participant = await db.collection("participants").findOne({ name: newParticipant.name });

    if (participant) {
        return res.status(409).send("Participante já existe!");
    }


    ///inserir no banco
    const statusMessage = { 
        from: name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: currentTime}

    const promise = db.collection("participants").insertOne(newParticipant)

    promise.then(() => {
    
        const promise2 = db.collection("messages").insertOne(statusMessage)
        promise2.then(() => {
            return res.sendStatus(201) 
        }); promise2.catch(err => {
            return res.status(500).send(err.message)
        })

    }); promise.catch(err => {
        return res.status(500).send(err.message)
    })

    
 


})

app.get("/participants", (req,res) => {
    const participants = db.collection("participants").find().toArray()
    .then (participants => {
        return res.send(participants)
    })
    .catch(err => {
        return res.status(500).send(err.message)
    })
})

app.post("/messages", async (req,res) => {

    const from = req.headers.user;
    const {to, text, type} = req.body
    const currentTime = dayjs().format('HH:mm:ss');

    const {error} = messageSchema.validate({to,text,type});

    if (error) {
        return res.status(422).send(error.details[0].message);
    }

    if (type !== "message" && type !== "private_message") {
        return res.status(422).send("O tipo de mensagem deve ser message ou private_message.");
    }


    ///verificação se o from existe na sala
    const participantFrom = await db.collection("participants").findOne({ name: from });

    if (!participantFrom) {
        return res.status(422).send("Remetente não encontrado.")
        
    }

     ///verificação se o destinatário existe na sala
     const participantTo = await db.collection("participants").findOne({ name: to });

     if (!participantTo) {
         return res.status(422).send(`Participante ${to} não encontrado.`)
         
     }

     const message = { 
        to: to,
        text: text,
        type: type,
        time: currentTime}

        const promise = db.collection("messages").insertOne(message)
        promise.then(() => {
            return res.sendStatus(201) 
        }); promise.catch(err => {
            return res.status(500).send(err.message)
        })

})

app.get("/messages", async (req, res) => {
    try {
      const messages = await db.collection("messages").find().toArray();
      return res.status(200).send(messages);
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });
  

app.post("/status", async (req, res) => {
    const User = req.headers.user;

    if (!User) {
        return res.status(404).send("O campo 'User' precisa ser preenchido no header.")
    }

    const promise = await db.collection("participants").findOne({name: User})

    if (!promise) {
        return res.status(422).send("Participante não encontrado.")
    }

    db.collection("participants").updateOne(
        { name: User },
        { $set: { lastStatus: Date.now() } },
        function (err, result) {
          if (err) {
            return res.status(400).send("Erro ao atualizar o documento: " + err)
          } else {
            return res.status(200).send("Sucesso ao atualizar o documento!")
          }
        }
      );
      
    


})

// async function logoutInativos() {
//     const now = Date.now();
//     const inativos = await db.collection("participants").find().toArray();
  
//     for (const participante of inativos) {
//       if (now - participante.lastStatus > 10) {
//         const currentTime = dayjs().format('HH:mm:ss');
//         console.log(participante.name, "foi deletado!");
//         await db.collection("participants").deleteOne({ _id: participante._id });

//         const message = {
//                 from: participante.name,
//                 to: 'Todos',
//                 text: 'sai da sala...',
//                 type: 'status',
//                 time: currentTime
//         }

//         await db.collection("messages").insertOne(message)
//         }
//       }
//     }
  
  
//   setInterval(logoutInativos, 15000);
  
  


app.listen(5000, () => console.log("Servidor ligado!"))