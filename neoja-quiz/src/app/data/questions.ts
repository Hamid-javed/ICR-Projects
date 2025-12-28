export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  hint: string;
  nextLocationHint: string;
}

export const questions: Question[] = [
  {
    id: "q1",
    question: "Which NBA player holds the record for the most points scored in a single game?",
    options: [
      "A. Michael Jordan",
      "B. Kobe Bryant",
      "C. Wilt Chamberlain",
      "D. LeBron James"
    ],
    correctAnswer: 2,
    points: 200,
    hint: "This player scored 100 points in a single game in 1962",
    nextLocationHint: "Look for the basketball court"
  },
  {
    id: "q2",
    question: "Which team won the first NBA championship?",
    options: [
      "A. Boston Celtics",
      "B. Philadelphia Warriors",
      "C. Minneapolis Lakers",
      "D. New York Knicks"
    ],
    correctAnswer: 1,
    points: 200,
    hint: "This team was based in Philadelphia",
    nextLocationHint: "Find the trophy display"
  },
  // {
  //   id: "q3",
  //   question: "Who is the NBA's all-time leading scorer?",
  //   options: [
  //     "A. Kareem Abdul-Jabbar",
  //     "B. LeBron James",
  //     "C. Michael Jordan",
  //     "D. Kobe Bryant"
  //   ],
  //   correctAnswer: 1,
  //   points: 200,
  //   hint: "This player is still active in the NBA",
  //   nextLocationHint: "Check the scoreboard area"
  // },
  // {
  //   id: "q4",
  //   question: "Which player has won the most NBA championships?",
  //   options: [
  //     "A. Michael Jordan",
  //     "B. Bill Russell",
  //     "C. Magic Johnson",
  //     "D. Kareem Abdul-Jabbar"
  //   ],
  //   correctAnswer: 1,
  //   points: 200,
  //   hint: "This player won 11 championships with the Celtics",
  //   nextLocationHint: "Look near the championship banners"
  // },
  // {
  //   id: "q5",
  //   question: "Who was the first player to dunk from the free-throw line in an NBA game?",
  //   options: [
  //     "A. Michael Jordan",
  //     "B. Julius Erving",
  //     "C. Vince Carter",
  //     "D. Dominique Wilkins"
  //   ],
  //   correctAnswer: 1,
  //   points: 200,
  //   hint: "This player was known as 'Dr. J'",
  //   nextLocationHint: "Find the free-throw line"
  // },
  // {
  //   id: "q6",
  //   question: "Which team has won the most NBA championships?",
  //   options: [
  //     "A. Los Angeles Lakers",
  //     "B. Boston Celtics",
  //     "C. Chicago Bulls",
  //     "D. Golden State Warriors"
  //   ],
  //   correctAnswer: 1,
  //   points: 200,
  //   hint: "This team has won 17 championships",
  //   nextLocationHint: "Check the team history wall"
  // },
  // {
  //   id: "q7",
  //   question: "Who was the first player to score 3,000 points in a single NBA season?",
  //   options: [
  //     "A. Wilt Chamberlain",
  //     "B. Michael Jordan",
  //     "C. Kobe Bryant",
  //     "D. James Harden"
  //   ],
  //   correctAnswer: 0,
  //   points: 200,
  //   hint: "This player averaged 50.4 points per game in 1961-62",
  //   nextLocationHint: "Look for the scoring records display"
  // },
  // {
  //   id: "q8",
  //   question: "Which player has the most career triple-doubles in NBA history?",
  //   options: [
  //     "A. Magic Johnson",
  //     "B. Russell Westbrook",
  //     "C. Oscar Robertson",
  //     "D. LeBron James"
  //   ],
  //   correctAnswer: 1,
  //   points: 200,
  //   hint: "This player is known as 'Mr. Triple Double'",
  //   nextLocationHint: "Find the stats display"
  // },
  // {
  //   id: "q9",
  //   question: "Who was the first player to win both NBA MVP and Defensive Player of the Year in the same season?",
  //   options: [
  //     "A. Michael Jordan",
  //     "B. Hakeem Olajuwon",
  //     "C. David Robinson",
  //     "D. Kevin Garnett"
  //   ],
  //   correctAnswer: 1,
  //   points: 200,
  //   hint: "This player was known as 'The Dream'",
  //   nextLocationHint: "Check the awards section"
  // },
  // {
  //   id: "q10",
  //   question: "Which team had the best regular season record in NBA history?",
  //   options: [
  //     "A. Chicago Bulls",
  //     "B. Golden State Warriors",
  //     "C. Los Angeles Lakers",
  //     "D. Boston Celtics"
  //   ],
  //   correctAnswer: 1,
  //   points: 200,
  //   hint: "This team won 73 games in the 2015-16 season",
  //   nextLocationHint: "Look for the record books"
  // }
]; 