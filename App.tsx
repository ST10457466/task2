import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert, FlatList } from 'react-native';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<'Home' | 'Game' | 'Result'>('Home');
  const [difficulty, setDifficulty] = useState<'Apprentice' | 'Wizard' | 'Sorcerer'>('Apprentice');
  const [equation, setEquation] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [powerUpAvailable, setPowerUpAvailable] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Helper to generate random number within a range
  const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Function to generate a random equation based on difficulty
  const generateEquation = () => {
    let num1, num2, op, eq = '', ans = 0;
    if (difficulty === 'Apprentice') {
      num1 = getRandomNumber(1, 10);
      num2 = getRandomNumber(1, 10);
      op = ['+', '-'][getRandomNumber(0, 1)];
    } else if (difficulty === 'Wizard') {
      num1 = getRandomNumber(5, 20);
      num2 = getRandomNumber(1, 15);
      op = ['+', '-', '*'][getRandomNumber(0, 2)];
    } else {
      num1 = getRandomNumber(10, 50);
      num2 = getRandomNumber(1, 20);
      op = ['+', '-', '*', '/'][getRandomNumber(0, 3)];
      if (op === '/') num2 = getRandomNumber(1, 10); // Limit division difficulty
    }

    switch (op) {
      case '+': ans = num1 + num2; break;
      case '-': ans = num1 - num2; break;
      case '*': ans = num1 * num2; break;
      case '/': ans = Math.floor(num1 / num2); break;
    }

    eq = `${num1} ${op} ${num2}`;
    setEquation(eq);
    setCorrectAnswer(ans);
  };

  // Timer logic with effect hooks
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && screen === 'Game') {
      Alert.alert('Time Over!', 'You ran out of time.');
      setScreen('Result');
    }
  }, [timer]);

  // Start a new game with initial values
  const startGame = () => {
    setScore(0);
    setTimer(difficulty === 'Apprentice' ? 30 : difficulty === 'Wizard' ? 20 : 15);
    generateEquation();
    setScreen('Game');
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    const numAnswer = parseInt(answer);
    if (numAnswer === correctAnswer) {
      setScore(score + 10);
      setTimer(timer + (difficulty === 'Apprentice' ? 5 : 3)); // Time extension for correct answers
      setPowerUpAvailable(true);
    } else {
      setTimer(timer - 5); // Penalty for wrong answer
    }
    setAnswer('');
    generateEquation();
  };

  // Use power-up to slow down the timer
  const usePowerUp = () => {
    if (powerUpAvailable) {
      setTimer(timer + 10); // Freeze/slow down time
      setPowerUpAvailable(false);
    }
  };

  // Save score to the leaderboard
  const saveToLeaderboard = () => {
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      name: 'Arithmetica',
      score,
    };
    setLeaderboard([...leaderboard, newEntry].sort((a, b) => b.score - a.score));
  };

  return (
    <View style={styles.container}>
      {screen === 'Home' && (
        <View style={styles.homeScreen}>
          <Text style={styles.title}>Welcome, young wizard!</Text>
          <Text style={styles.subtitle}>Help Arithmetica master her magical arithmetic skills.</Text>
          <Button title="Start Training" onPress={() => startGame()} />
          <View style={styles.difficultyButtons}>
            <Button title="Apprentice" onPress={() => setDifficulty('Apprentice')} />
            <Button title="Wizard" onPress={() => setDifficulty('Wizard')} />
            <Button title="Sorcerer" onPress={() => setDifficulty('Sorcerer')} />
          </View>
        </View>
      )}

      {screen === 'Game' && (
        <View style={styles.gameScreen}>
          <Text style={styles.title}>Arithmetica faces a challenge!</Text>
          <Text style={styles.subtitle}>Solve the equation to cast the spell:</Text>
          <Text style={styles.equation}>{equation}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={answer}
            onChangeText={setAnswer}
            placeholder="Enter your answer"
          />
          <Button title="Submit" onPress={handleSubmitAnswer} />
          <Text style={styles.timer}>Time Left: {timer}s</Text>
          {powerUpAvailable && <Button title="Use Time Warp" onPress={usePowerUp} />}
        </View>
      )}

      {screen === 'Result' && (
        <View style={styles.resultScreen}>
          <Text style={styles.title}>Training Complete!</Text>
          <Text style={styles.subtitle}>Final Score: {score}</Text>
          <Button title="Continue Training" onPress={() => startGame()} />
          <Button title="Save Score" onPress={saveToLeaderboard} />
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={styles.leaderboardEntry}>{item.name}: {item.score} points</Text>
            )}
          />
        </View>
      )}
    </View>
  );
};

// Styling for the app
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6E6FA' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 10 },
  subtitle: { fontSize: 18, margin: 5 },
  homeScreen: { alignItems: 'center' },
  difficultyButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  gameScreen: { alignItems: 'center' },
  equation: { fontSize: 28, fontWeight: 'bold', margin: 10 },
  input: { borderColor: 'black', borderWidth: 1, width: 200, padding: 10, margin: 10, textAlign: 'center' },
  timer: { fontSize: 18, margin: 10 },
  resultScreen: { alignItems: 'center' },
  leaderboardEntry: { fontSize: 16, margin: 5 },
});

export default App;
