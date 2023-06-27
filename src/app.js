import express from "express"
import Joi from "joi";

const app = express()
app.use(express.json())

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

  ////necessário salvar as coisas nas collections
  ///necessário colocar o formato correto ao entrar na sala de horário usando a lib dayjs
app.post("/participants", (req,res) => {
    const {name} = req.body

    const { error } = signUpSchema.validate(name);

    if (error) {
        return res.status(422).send(error.details[0].message);
    }

    if (participants.find((participant) => participant.name === name)) {
        return res.status(409).send(error.details[0].message);
    }

    participants.push({
        name: name,
        lastStatus: Date.now()
    })

    messages.push({  
    from: name,
    to: 'Todos',
    text: 'entra na sala...',
    type: 'status',
    time: 'HH:mm:ss'})

    res.sendStatus(201)


})

app.get("/participants", (req,res) => {
    res.send(participants)
})


///Já o from da mensagem, ou seja, o remetente, não será enviado pelo body. 
///Será enviado pelo cliente através de um header na requisição chamado User. 

///from é obrigatório e deve ser um participante existente na lista de participantes 
//(ou seja, que está na sala).


///As validações deverão ser feitas com a biblioteca joi, 
///com exceção da validação de um participante existente na lista de participantes (use as funções do MongoDB para isso).

// - [ ]  Ao salvar essa mensagem, deve ser acrescentado o atributo **time**, contendo a hora atual no formato HH:mm:ss (utilize a biblioteca `dayjs`).
// - [ ]  Por fim, em caso de sucesso, retornar **status 201**. Não é necessário retornar nenhuma mensagem além do status.
// - [ ]  Salve a mensagem na collection de nome `messages` com o formato proposto na seção de armazenamento de dados.

app.post("/messages", (req,res) => {

    const {to, text, type} = req.body

    const {error} = messageSchema.validate();

    if (error) {
        return res.status(422).send(error.details[0].message);
    }

    if (type !== "message" || "private_message") {
        return res.status(422).send(error.details[0].message);
    }

    if (!participants.find((participant) => participant.name === from)) {
        return res.status(422).send("Participante não encontrado: " + error.details[0].message);
    }

    res.statusCode(201)

})


app.listen(5000, () => console.log("Servidor ligado!"))