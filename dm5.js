import { assign, createActor, setup } from "xstate";
import { speechstate } from "speechstate";
import { createBrowserInspector } from "@statelyai/inspect";
import { KEY, NLU_KEY } from "./azure.js";

const inspector = createBrowserInspector();

const azureCredentials = {
  endpoint: "https://northeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
  key: KEY,
};

const azureLanguageCredentials = {
  endpoint: "https://260026.cognitiveservices.azure.com/language/:analyze-conversations?api-version=2022-10-01-preview",
  key: NLU_KEY,
  deploymentName: "Appointment",
  projectName: "Appointment",
};
const settings = {
  azureLanguageCredentials: azureLanguageCredentials,
  azureCredentials: azureCredentials,
  asrDefaultCompleteTimeout: 0,
  asrDefaultNoInputTimeout: 5000,
  local: "en-US",
  ttsDefaultVoice: "en-US-DavisNeural",
};

const grammar = {
  vlad: { person: "Vladislav Maraev" },
  aya: { person: "Nayat Astaiza Soriano" },
  rasmus: { person: "Rasmus Blanck" },
  david: { person: "David" },
  monday: { day: "Monday" },
  tuesday: { day: "Tuesday" },
  "10": { time: "10:00" },
  "11": { time: "11:00" },  
  yes: { response: "yes" },
  no: { response: "no" },
  "nelson mandela": { who: "Nelson Mandela was a South African anti-apartheid revolutionary and the country's first Black president, serving from 1994 to 1999. He is celebrated globally for his leadership in the fight for racial equality, peace, and reconciliation." },
  "fidel castro": { who: "Fidel Castro was the revolutionary leader who ruled Cuba from 1959 to 2008, shaping the island nation's socialist government and its Cold War-era relations with the U.S. His leadership is both praised for its role in advancing education and healthcare and criticized for its suppression of political dissent and economic challenges." },
  "indira gandhi": { who: "Indira Gandhi was the first and, to date, the only female Prime Minister of India, serving from 1966 to 1977 and again from 1980 until her assassination in 1984. Her tenure was marked by significant economic and social reforms, but also by controversy, including the imposition of a state of emergency that curtailed democratic freedoms." },
  "kobe bryant": { who: "Kobe Bryant was an iconic NBA player who spent his entire 20-season career with the Los Angeles Lakers, earning five championships and two NBA Finals MVP awards. Known for his scoring prowess and competitive spirit, Bryant left a lasting impact on basketball and inspired many with his dedication both on and off the court." },
  "noam chomsky": { who: "Noam Chomsky is a renowned linguist and cognitive scientist known for his groundbreaking work in the theory of generative grammar, which has profoundly influenced the field of linguistics. Additionally, he is a prominent political activist and critic, offering sharp analyses of media, politics, and power structures." },
  "dag hammarskjöld": { who: "Dag Hammarskjöld was the second Secretary-General of the United Nations, serving from 1953 until his untimely death in 1961. His tenure is remembered for his efforts to strengthen the UN's role in international peacekeeping and his dedication to resolving conflicts during the Cold War era." },
  "donald trump": { who: "Donald Trump is a businessman and former U.S. president who served from 2017 to 2021, known for his unconventional political style and polarizing policies. He remains an influential figure in American politics, continuing to shape the Republican Party and public discourse." },
  "vladimir putin": { who: "Vladimir Putin has been a dominant figure in Russian politics, serving as President or Prime Minister of Russia since 1999. His leadership is marked by efforts to centralize power, assert Russian influence globally, and maintain control over domestic politics, often drawing significant international scrutiny and controversy." },
  "haile gebresilassie": { who: "Haile Gebreselassie is an Ethiopian long-distance runner renowned for his dominance in the marathon and track events, having set numerous world records and won two Olympic gold medals. His remarkable achievements and enduring influence have made him a celebrated figure in the world of athletics." },
  "cristiano ronaldo": { who: "Cristiano Ronaldo is a Portuguese professional footballer widely regarded as one of the greatest players of all time, known for his prolific goal-scoring ability and numerous awards, including multiple Ballon d'Or titles. His career spans top clubs like Manchester United, Real Madrid, and Juventus, as well as a significant impact on the Portuguese national team." },  
};

const personInformation = {
  "nelson mandela": { response: "Nelson Mandela was a South African anti-apartheid revolutionary and the country's first Black president, serving from 1994 to 1999. He is celebrated globally for his leadership in the fight for racial equality, peace, and reconciliation." },
  "fidel castro": { response: "Fidel Castro was the revolutionary leader who ruled Cuba from 1959 to 2008, shaping the island nation's socialist government and its Cold War-era relations with the U.S. His leadership is both praised for its role in advancing education and healthcare and criticized for its suppression of political dissent and economic challenges." },
  "indira gandhi": { response: "Indira Gandhi was the first and, to date, the only female Prime Minister of India, serving from 1966 to 1977 and again from 1980 until her assassination in 1984. Her tenure was marked by significant economic and social reforms, but also by controversy, including the imposition of a state of emergency that curtailed democratic freedoms." },
  "kobe bryant": { response: "Kobe Bryant was an iconic NBA player who spent his entire 20-season career with the Los Angeles Lakers, earning five championships and two NBA Finals MVP awards. Known for his scoring prowess and competitive spirit, Bryant left a lasting impact on basketball and inspired many with his dedication both on and off the court." },
  "noam chomsky": { response: "Noam Chomsky is a renowned linguist and cognitive scientist known for his groundbreaking work in the theory of generative grammar, which has profoundly influenced the field of linguistics. Additionally, he is a prominent political activist and critic, offering sharp analyses of media, politics, and power structures." },
  "dag hammarskjöld": { response: "Dag Hammarskjöld was the second Secretary-General of the United Nations, serving from 1953 until his untimely death in 1961. His tenure is remembered for his efforts to strengthen the UN's role in international peacekeeping and his dedication to resolving conflicts during the Cold War era." },
  "donald trump": { response: "Donald Trump is a businessman and former U.S. president who served from 2017 to 2021, known for his unconventional political style and polarizing policies. He remains an influential figure in American politics, continuing to shape the Republican Party and public discourse." },
  "vladimir putin": { response: "Vladimir Putin has been a dominant figure in Russian politics, serving as President or Prime Minister of Russia since 1999. His leadership is marked by efforts to centralize power, assert Russian influence globally, and maintain control over domestic politics, often drawing significant international scrutiny and controversy." },
  "haile gebresilassie": { response: "Haile Gebreselassie is an Ethiopian long-distance runner renowned for his dominance in the marathon and track events, having set numerous world records and won two Olympic gold medals. His remarkable achievements and enduring influence have made him a celebrated figure in the world of athletics." },
  "cristiano ronaldo": { response: "Cristiano Ronaldo is a Portuguese professional footballer widely regarded as one of the greatest players of all time, known for his prolific goal-scoring ability and numerous awards, including multiple Ballon d'Or titles. His career spans top clubs like Manchester United, Real Madrid, and Juventus, as well as a significant impact on the Portuguese national team." },  
};

function isPersonInformation(utterance) {
  console.log('Checking if person is in information:', utterance.toLowerCase());  
  return utterance.toLowerCase() in personInformation;
}

function getResponse(utterance) {
  const person = utterance?.trim()?.toLowerCase();  
  console.log('Checking person:', person);  

  const personInfo = personInformation[person];  
  console.log('Person info found:', personInfo);  

  return (personInfo || {}).response;  
}

//const userPrompts = ["Please say something!", "Are you there?", "I cannot hear you.", "Are you still with me?", "I’m waiting for your reply."];

const NOINPUT_DELAY = 10000;

const MAX_NOINPUT = 3;

const handleMaxNoInput = (context) => {
  if (context.count >= MAX_NOINPUT) {
    context.ssRef.send({ type: 'MAX_NOINPUT_REACHED' });
  }
};

function randomRepeat(userPrompts) {
  const prompts = [
    "Are you still there?",
    "Please say something!",
    "I cannot hear you.",
    "Are you still with me?",
    "I’m waiting for your reply."
  ];
  
  return prompts[Math.floor(Math.random() * prompts.length)];
}

function getInfoPerson(utterance) {
  const person = utterance?.toLowerCase();
  console.log('Getting info for:', person);
  return (personInformation[person] || {}).response;
}

function isInGrammar(utterance) {
  return !!utterance && (utterance.toLowerCase() in grammar);
}

function normalizeTimeUtterance(utterance) {
  return utterance.replace(/[^0-9]/g, '');  
}


function getMeetingDay(utterance) {
  console.log('Getting meeting day for:', utterance.toLowerCase());
  return (grammar[utterance.toLowerCase()] || {}).day;
}

function getMeetingTime(utterance) {
  return (grammar[utterance.toLowerCase()] || {}).time;
}

function getMeetingDate(utterance) {
  const today = new Date();
  const dayOfWeek = today.getDay(); 

  const daysOfWeek = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
  };

  utterance = utterance.toLowerCase();
  
  if (utterance.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toLocaleDateString();
  }
  
  if (utterance.includes("next")) {
    const dayName = utterance.split("next ")[1];
    if (daysOfWeek[dayName]) {
      const targetDay = daysOfWeek[dayName];
      let daysUntilNext = (targetDay + 7 - dayOfWeek) % 7 || 7;
      const nextDay = new Date();
      nextDay.setDate(today.getDate() + daysUntilNext);
      return nextDay.toLocaleDateString();
    }
  }
  
  const dayName = utterance.trim().toLowerCase();
  if (daysOfWeek[dayName]) {
    const targetDay = daysOfWeek[dayName];
    let daysUntil = (targetDay + 7 - dayOfWeek) % 7 || 7; 
    const meetingDay = new Date();
    meetingDay.setDate(today.getDate() + daysUntil);
    return meetingDay.toLocaleDateString();
  }

  return utterance;
}
const dmMachine = setup({
  actions: {
    say: ({ context }, params) => {
      context.ssRef.send({
        type: "SPEAK",
        value: { utterance: params },
      });
    },
    listen: ({ context }) => {
      context.ssRef.send({
        type: "LISTEN",
        value: { nlu: true },
      });
    },
  },
}).createMachine({
  initial: "Prepare",
  context: {
    count: 0,
    ssRef: null,
    meetingWithName: "",
    meetingDate: "",
    meetingTime: "",
    response: "",
    isWholeDay: false,    
    userPrompts: [ ]
  },
  id: "DM",
  states: {
    Prepare: {
      entry: [
        assign({
          ssRef: ({ spawn }) => spawn(speechstate, { input: settings }),
        }),
        ({ context }) => context.ssRef.send({ type: "PREPARE" }),
      ],
      on: { ASRTTS_READY: "CreateAppointment" },
    },    
    CreateAppointment: {
      initial: "IntroduceApp",
      states: {
        IntroduceApp: {
          entry: {
            type: "say",
            params: "Welcome! This app can assist you with scheduling meetings, retrieving personal information, and more. I’ll guide you through everything step-by-step. Let’s get started!",
          },
          on: { SPEAK_COMPLETE: "AskHelp" },
        },
        AskHelp: {
          entry: { type: "say", params: "How can I help you?" },
          on: { SPEAK_COMPLETE: "ListenToStart" },
        },
        ListenToStart: {
          entry: { type: "listen" },
          on: {
            RECOGNISED: [
              {
                guard: ({ event }) => event.value?.[0]?.utterance?.toLowerCase() === "get personal info",
                target: "#DM.CreateAppointment.GetInfoPerson",
              },
              {
                guard: ({ event }) => event.value?.[0]?.utterance?.toLowerCase() === "create a meeting",
                target: "#DM.CreateAppointment.AskName",
              },
              {
                guard: ({ event }) => !event.value?.[0]?.utterance,
                target: "NotGrammar",
              },
            ],
            ASR_NOINPUT: "NOINPUT",
          },
        },
        NOINPUT: {          
          entry: [            
            ({ context }) => {
              console.log('NOINPUT State Entered: Count =', context.count);
              context.count += 1;              
              handleMaxNoInput(context);  
            },            
            ({ context }) =>
              context.ssRef.send({
                type: "SPEAK",
                value: {
                  utterance: randomRepeat(context.userPrompts),  
                },
              }),
          ],
          on: {
            SPEAK_COMPLETE: [
              {
                guard: (context) => context.count < MAX_NOINPUT,
                target: "AskHelp",  
              },
              {
                guard: (context) => context.count >= MAX_NOINPUT,
                target: "HandleNoInput",  
              },
            ],
          },
          after: {
            5000: "AskHelp",  
          },
          // entry: [
          //   ({ context }) => {
          //     console.log('NOINPUT State Entered: Count =', context.count);
          //     context.count++;
          //     handleMaxNoInput(context);  
          //   },
          //   ({ context }) =>
          //     context.ssRef.send({
          //       type: "SPEAK",
          //       value: {
          //         utterance: randomRepeat(context.userPrompts),  
          //       },
          //     }),
          // ],
          // on: {
          //   SPEAK_COMPLETE: [
          //     {
          //       guard: (context) => context.count < MAX_NOINPUT,
          //       target: "AskHelp",  
          //     },
          //     {
          //       guard: (context) => context.count >= MAX_NOINPUT,
          //       target: "HandleNoInput",  
          //     },
          //   ],
          // },          
        },
        HandleNoInput: {          
          entry: ({ context }) => {
            console.log('MAX_NOINPUT reached, transitioning to complete'); 
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: "It seems like you're not there. Please reach out if you need further assistance.",
              },
            });
            context.count = 0;  
          },
          on: {
            SPEAK_COMPLETE: "#Complete",  
          },
        }, 
        GetInfoPerson: {
          entry: {
            type: "say",
            params: "Who would you like to know more about?", 
          },
          on: {
            SPEAK_COMPLETE: "ListenGetInfoPerson",
          },
        },
        ListenGetInfoPerson: {
          entry: {
            type: "listen",
          },
          on: {
            RECOGNISED: [
              {
                guard: ({ event }) =>
                  event.value?.[0]?.utterance && isPersonInformation(event.value[0].utterance),
                target: "ProvidePersonInfo",
              },
              {
                guard: ({ _, event }) => !event.nluValue || !event.nluValue.topIntent,
                target: "NotGrammar",
              },
            ],
            ASR_NOINPUT: "NOINPUT",
            NOINPUT: {
              target: "#DM.CreateAppointment.AskHelp",
            },
          },
        },        
        ProvidePersonInfo: {
          entry: [
            ({ context, event }) => {
              const utterance = event.value[0].utterance.trim().toLowerCase();  
              console.log('Recognized utterance:', utterance);  
        
              const response = getResponse(utterance);  
              console.log('Response from getResponse:', response);          
              
              context.response = response || "I don't have information about that person.";  
            },
            ({ context }) => {
              console.log('Assigned response in context:', context.response);         
              
              context.ssRef.send({
                type: "SPEAK",
                value: {
                  utterance: `You asked about ${context.response}.`,
                },
              });
            },
          ],          
          on: {             
            SPEAK_COMPLETE: { target: "MoreHelp" },            
          },
        },        
        MoreHelp: {
          entry: ({ context }) => 
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: "Do you need anything else?",
              }
            }),
            on: {
              SPEAK_COMPLETE: {
                target: "ListenCheckMoreHelp"
              }
            }
        },
        ListenCheckMoreHelp:{
            entry: ({ context }) =>
            context.ssRef.send({
              type: "LISTEN",
            }),

          on: {
            RECOGNISED: [
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "yes",
                target: "AskHelp",
                actions: assign({
                  MoreHelp: "yes",
                }),
              },
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "no",
                target: "#Complete",
                actions: assign({
                  MoreHelp: "no",
                }),
              },
            ],
            NOINPUT: {
              entry: "HandleNoInput",
              always: "waitForUserInput"
            }
          },

        }, 
        NotGrammar: {
          entry: {
            type: "say",
            params: "I'm sorry, that's not in the grammar. Could you please say something else?",
          },
          on: {
            SPEAK_COMPLETE: [
              {
                guard: ({ context, event }) => event.value && event.value[0] && isInGrammar(event.value[0].utterance),
                target: "AskName",
              },
              {
                target: "#DM.CreateAppointment.ListenToStart",
              },
            ],
          },
        },
        AskName: {
          entry: {
            type: "say",
            params: "Who would you like to meet?",
          },
          on: {            
            SPEAK_COMPLETE: "meetingWithName",
          },
        },
        meetingWithName: {
          entry: {
            type: "listen",
          },
          on: {
            RECOGNISED: [
              // {
              //   guard: ({ event }) => isInGrammar(event.value[0].utterance),
              //   actions: assign({
              //     meetingWithName: ({ event }) => {
              //       const name = getInfoPerson(event.value[0].utterance);
              //       console.log("Assigned meetingWithName:", name); 
              //       return name;
              //     },
              //   }),
              //   target: "GetMeetingDay",
              // },
              // {
              //   target: "NotInGrammar",
              // },
              {                
                guard: ({ event }) => {
                  const utterance = event.value[0].utterance;
                  const confidence = event.value[0].confidence || 0;
                  const isValidName = isInGrammar(utterance);
                  
                  console.log(`Recognized name: ${utterance}, Confidence: ${confidence}`);                  
                  
                  return isValidName && confidence >= 0.7;
                },
                actions: assign({
                  meetingWithName: ({ event }) => {
                    const name = getInfoPerson(event.value[0].utterance);
                    console.log("Assigned meetingWithName:", name); 
                    return name;
                  },
                }),
                target: "GetMeetingDay",
              },
              {
                // Handle case where confidence is low or name is not in grammar
                target: "NotInGrammar",
              },
            ],
          },
        },                
        GetMeetingDay: {
          entry: {
            type: "say",
            params: "Which day would you like to schedule the meeting?",
          },
          on: {
            SPEAK_COMPLETE: "ListenMeetingDay",
          },
        },
        ListenMeetingDay: {
          entry: {
            type: "listen",
          },
          on: {
            RECOGNISED: [
              {
                guard: ({ event }) => isInGrammar(event.value[0].utterance),
                actions: assign({
                  meetingDate: ({ event }) => {
                    const date = getMeetingDate(event.value[0].utterance);
                    console.log("Assigned meetingDate:", date); 
                    return date;
                  },
                }),
                target: "IsWholeDay",
              },
              {
                target: "Help",
              },
            ],
          },
        },
        Help: {          
          entry: ({ context }) =>
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: `There is no time available on this day. You can only book on Mondays and Tuesdays now. Would you like to change the day? `,
              },
            }),
          on: {
            SPEAK_COMPLETE: "ListenToHelpResponse",
          },
          
        },
        ListenToHelpResponse: {
          entry: {
            type: "listen",
          },
          on: {
            RECOGNISED: [
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "yes",
                target: "GetMeetingDay", 
              },
              
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "no",
                target: "AppointmentNotCreated",
                actions: assign({
                  meetingTime: "",
                  isWholeDay: false,
                }),
              },
            ],
          },
        },
        IsWholeDay: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: "Will it take the whole day?",
              },
            }),
          on: { SPEAK_COMPLETE: "CheckWholeDay" },
        },
        CheckWholeDay: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "LISTEN",
            }),

          on: {
            RECOGNISED: [
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "yes",
                target: "ConfirmWholeDayAppointment",
                actions: assign({
                  isWholeDay: "yes",
                }),
              },
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "no",
                target: "GetMeetingTime",
                actions: assign({
                  isWholeDay: "no",
                }),
              },
            ],
            NOINPUT: {
              entry: "HandleNoInput",
              always: "waitForUserInput"
            }
          },
        },
        GetMeetingTime: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: "What time is your meeting?",
              },
            }),
          on: { SPEAK_COMPLETE: "ListenMeetingTime" },
        },
        ListenMeetingTime: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "LISTEN",
            }),
          on: {
            RECOGNISED: {
              target: "ConfirmAppointment",
              actions: assign({
                meetingTime: ({ event }) => event.value[0].utterance.toLowerCase(),
              }),
            },
          },
        },
        RepeatPrompt: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: "I'm sorry, could you please repeat that? If you need assistance, just say 'help'.",
              },
            }),
          on: { SPEAK_COMPLETE: "ListenMeetingTime", },
        },
        ConfirmWholeDayAppointment: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: `Do you want to create an appointment with ${context.meetingWithName} It will be on ${context.meetingDate} for the whole day?`,
              },
            }),
          on: { SPEAK_COMPLETE: "ListenConfirmation" },
        },
        ConfirmAppointment: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: `Do you want to create an appointment with ${context.meetingWithName} It will be on ${context.meetingDate} at ${context.meetingTime}?`,
              },
            }),
          on: { SPEAK_COMPLETE: "ListenConfirmation" },
        },
        ListenConfirmation: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "LISTEN",
            }),
          on: {
            RECOGNISED: [
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "yes",
                target: "AppointmentCreated",
              },
              {
                guard: ({ event }) => event.value[0].utterance.toLowerCase() === "no",
                target: "AppointmentNotCreated",
                actions: assign({
                  meetingTime: "",
                  isWholeDay: false,
                }),
              },
            ],
          },
        },        
        AppointmentCreated: {
          entry: {
            type: "say",
            params: "Your meeting has been scheduled. Have a great day!",
          },
          on: {
            SPEAK_COMPLETE: "#Complete",  
          },
        },
        AppointmentNotCreated: {
          entry: ({ context }) =>
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: "Your appointment has not been created.",
              },
            }),
          // after: {
          //   1000: "#Complete", 
          // },
          on: {
            SPEAK_COMPLETE: "#Complete",  
          },
        },
        Complete: {
          type: "final",
        },
        // AppointmentNotCreated: {
        //             entry: ({ context }) =>
        //               context.ssRef.send({
        //                 type: "SPEAK",
        //                 value: {
        //                   utterance: "Your appointment has not been created.",
        //                 },
        //                 on: {
        //                   SPEAK_COMPLETE: "#Complete",  
        //                 },
        //               }),
        //             type: "final",
        //           },        
        NotInGrammar: {
          entry: {
            type: "say",
            params: "I'm sorry, I didn't recognize that. Could you please say it again?",
          },
          on: {
            SPEAK_COMPLETE: "ListenToStart",
          },
        },
        HandleNoInput: {
          entry: ({ context }) => {
            console.log('MAX_NOINPUT reached, transitioning to complete'); 
            context.ssRef.send({
              type: "SPEAK",
              value: {
                utterance: "Sorry, it seems I am not receiving any input. Ending the session now.",
              },
            });
            context.count = 0;  
          },
          on: {
            SPEAK_COMPLETE: "#Complete",  
          },
        },        
        // HandleNoInput: {
        //   entry: {
        //     type: "say",
        //     params: "It seems like you're not there. Please reach out if you need further assistance.",
        //   },
        //   on: {
        //     SPEAK_COMPLETE: "#Complete",  
        //   },
        // },
      },
    },
    Complete: {
      id: "Complete",
      initial: "SpeakingComplete",
      states: {
        SpeakingComplete: {
          entry: {
            type: "say",
            params: "Thank you for using the App!",
          },
          on: {
            SPEAK_COMPLETE: "Done",
          },
        },
        Done: {
          type: "final",
          entry: [
            
            assign({
              ssRef: ({ spawn }) => spawn(speechstate, { input: settings }),
            }),
            ({ context }) => {
              
              console.log("Service completed. Restarting or resetting if necessary.");
            },
          ],
        },
      },      
      onDone: {
        target: "Prepare",  
      },
    },  
        
  },
});
const dmActor = createActor(dmMachine, {
    inspect: inspector.inspect,
  }).start();
  dmActor.subscribe((state) => {
    console.log("Current state:", state.value);
    //console.log("Meeting with:", state.context.meetingWithName);
    //console.log("Who is:", state.context.GetInfoPerson);
  });
  
  export function setupButton(element) {
    element.addEventListener("click", () => {
      dmActor.send({ type: "CLICK" });
    });
    dmActor.getSnapshot().context.ssRef.subscribe((snapshot) => {
      element.innerHTML = `${snapshot.value.AsrTtsManager.Ready}`;
    });
  }
  
  dmActor.subscribe((state) => {
    console.log(state);
  });
