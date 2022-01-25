import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity, Animated
} from 'react-native';
import {Colors} from "./Constants";
import {fontPixel, heightPixel, pixelSizeVertical, widthPixel} from "./utils/normalize";
import {db} from './firestore'; // update with your path to firestore config
import {useEffect, useState} from "react";
import {collection, query, orderBy, startAfter, limit, getDocs} from "firebase/firestore";
import * as Haptics from "expo-haptics";

const height = Dimensions.get("window").height

export default function App() {

    const [snaps, setSnaps] = useState<Object | null>(null)
    const [correctAnswer, setCorrectAnswer] = useState<Object>('')
    const [question, setQuestion] = useState<Object>('')
    const [loading, setLoading] = useState(true);
    const [submittedAnswer, setSubmittedAnswer] = useState('');

    const [toValue, setToValue] = useState(250);
    const [toastTranslate, setToastTranslate] = useState(new Animated.Value(0));

    const [responseType, setResponseType] = useState('');
    const [response, setResponse] = useState('')


    const getQuestion = async () => {

        // Query the first page of docs
        const first = query(collection(db, "questions"), orderBy("difficulty"), limit(25));
        const documentSnapshots = await getDocs(first);

        // Get the last visible document
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setSnaps(lastVisible.data())
        setCorrectAnswer(lastVisible.data().correctAnswer)
        await setQuestion(lastVisible.data().question)
        setLoading(false)
        //console.log(lastVisible.data())
    }


// Construct a new query starting at this document,
// get the next 25 cities.
    const next = async () => {
        const nextQ = query(collection(db, "questions"),
            orderBy("difficulty"),
            startAfter(snaps),
            limit(25));

        const documentSnaps = await getDocs(nextQ);

        // Get the last visible document
        const nextVisible = documentSnaps.docs[documentSnaps.docs.length - 1];
        setSnaps(nextVisible)
        setLoading(false)

    }

    useEffect(() => {

        getQuestion()

    }, [correctAnswer]);

    const submitAnswer = (answer: string) => {
        setSubmittedAnswer(answer)

    }


    useEffect(() => {
        Animated.spring(toastTranslate, {
            toValue: toValue,
            stiffness: 100,
            damping: 20,
            mass: 1,
            useNativeDriver: true
        }).start()

    }, [response, toValue])


    useEffect(() => {

        if (response) {
            const timer = setTimeout(() => {
                setToValue(250)
            }, 3000)

            return () => {
                clearTimeout(timer)
            }
        }
    }, [response, toValue]);


    const checkAnswer = () => {
        setToValue(0)
        if (submittedAnswer === correctAnswer) {
            setResponse('Great job!!')
            setResponseType('success')
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } else {
            setResponse(`Wrong Answer: ${submittedAnswer}!`)
            setResponseType('error')
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
    }

    let color;
    if (toValue === 0) {
        color = '#fff'
    } else if (!submittedAnswer) {
        color = "#6392A6"
    } else {
        color = "#00E0EA"
    }

    if (loading) {
        return <ActivityIndicator style={StyleSheet.absoluteFillObject} size={"small"} color={Colors.primary}/>
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            alignItems: 'center'
        }}>

            <Animated.View
                style={[{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    position: "absolute",
                    width: '100%',
                    bottom: 0,
                    padding: 10,
                    height: 250,
                    zIndex: 1,
                    backgroundColor: responseType === 'success' ? "#00E0EA" : '#FF7E87',
                    borderRadius: 20,
                },
                    {
                        transform: [
                            {
                                translateY: toastTranslate
                            }
                        ]
                    }]}
            >
                <Text style={styles.responseText}>
                    {response}
                </Text>
            </Animated.View>

            <View style={styles.container}>
                <View style={styles.answerArea}>

                    <Text style={styles.instruction}>Fill in the missing word</Text>

                    <Text style={styles.englishText}>
                        {snaps.english}
                    </Text>
                    {
                        submittedAnswer ?
                            <Text style={styles.questionText}>
                                {question.replace(correctAnswer, submittedAnswer)}
                            </Text>
                            : <Text style={styles.questionText}>
                                {question.replace(correctAnswer, "________")}
                            </Text>
                    }


                    <View style={styles.answers}>
                        {snaps.answers.map((answer: string, i: number) => (
                            <TouchableOpacity onPress={() => submitAnswer(answer)} key={i} style={styles.btn}>
                                <Text style={styles.answerText}>
                                    {answer}
                                </Text>
                            </TouchableOpacity>
                        ))
                        }
                    </View>


                </View>

            </View>
            <TouchableOpacity disabled={!submittedAnswer || toValue === 0} onPress={checkAnswer}
                              style={[styles.submitBtn, {
                                  backgroundColor: color,
                              }]}>
                <Text style={[styles.btnText, {
                    color: toValue === 0 ? '#333' : '#fff'
                }]}>
                    Continue
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primary,
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    answerArea: {
        height: heightPixel(height - 100),
        width: '100%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        alignItems: 'center',
        backgroundColor: Colors.secondary
    },
    instruction: {
        color: '#fff',
        marginVertical: pixelSizeVertical(20),
        fontSize: fontPixel(20),
        fontWeight: '500'
    },
    englishText: {
        color: '#fff',
        marginVertical: pixelSizeVertical(20),
        fontSize: fontPixel(25),
        fontWeight: '700'
    },
    answerText: {
        color: '#333',
        fontSize: fontPixel(14),
        fontWeight: '500'
    },
    questionText: {
        color: '#fff',
        fontSize: fontPixel(25),
        fontWeight: '400'
    },
    btn: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: widthPixel(100),
    },
    answers: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '70%',
        height: 300,
        marginVertical: pixelSizeVertical(10),
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    submitBtn: {
        bottom: 50,
        position: 'absolute',
        zIndex: 40,

        width: '80%',
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    btnText: {
        fontWeight: '600',
        fontSize: fontPixel(14),
    },
    responseText: {
        fontWeight: '600',
        fontSize: fontPixel(20),
        color: '#fff'
    }
});
