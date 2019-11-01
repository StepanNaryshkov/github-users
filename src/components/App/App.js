import React from 'react';
import Main from '../Main/Main';

const placeCards = [
  {
    name: `Beautiful &amp; luxurious apartment at great location`,
    premium: true,
    img: `img/apartment-01.jpg`,
    price: 120,
    rating: `93%`,
    type: `Apartment`,
  },
  {
    name: `Canal View Prinsengracht`,
    premium: false,
    img: `img/apartment-02.jpg`,
    price: 132,
    rating: `80%`,
    type: `Apartment`,
  },
  {
    name: `Nice, cozy, warm big bed apartment`,
    premium: true,
    img: `img/apartment-03.jpg`,
    price: 180,
    rating: `100%`,
    type: `Apartment`,
  },
  {
    name: `Wood and stone place`,
    premium: false,
    img: `img/room.jpg`,
    price: 80,
    rating: `80%`,
    type: `Private room`,
  },
];

const App = () => <Main placeCards={placeCards} />;

export default App;
