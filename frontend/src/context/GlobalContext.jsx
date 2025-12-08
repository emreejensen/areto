import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios'; 

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuiz, setCurrentQuiz] = useState(null); 
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [timeSpent, setTimeSpent] = useState(0); // ⏱ Track time spent

    const fetchQuizzes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/quizzes'); 
            setAllQuizzes(response.data);
        } catch (err) {
            console.error("Failed to fetch quizzes:", err);
            setError("Failed to load quizzes from the server.");
            toast.error("Could not load quizzes. Server might be down.");
        } finally {
            setIsLoading(false);
        }
    };

    // Reset quiz state
    const resetQuiz = () => {
        setCurrentQuiz(null);
        setQuizAnswers([]);
        setTimeSpent(0); // reset timer
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const contextValue = {
        allQuizzes,
        isLoading,
        error,
        fetchQuizzes,
        currentQuiz,
        setCurrentQuiz,
        quizAnswers,
        setQuizAnswers,
        timeSpent,
        setTimeSpent,
        resetQuiz,
    };

    return (
        <GlobalContext.Provider value={contextValue}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
