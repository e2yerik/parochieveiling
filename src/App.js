import React from 'react';

import './App.scss';

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import HomeComponent from './pages/HomePage';
import ProductPageComponent from './pages/ProductPage/ProductPage';
import ProductListerComponent from './pages/ProductLister/ProductListerPage';

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache()
});


function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <Router>
          <nav className="page__nav">
            <div className="container box-padding">
              <Link to="/" className="page__nav-link page__nav-link--icon"><FontAwesomeIcon icon={faHome} /></Link>
              <Link to="/kavels" className="page__nav-link">Kavels</Link>
              <Link to="/biedingen" className="page__nav-link">Mijn biedingen</Link>
            </div>
          </nav>
          <main className="page__content container box-padding">
            <Route path="/" component={HomeComponent} exact />
            <Route path="/kavels" component={ProductListerComponent} />
            <Route path="/kavel/:id" component={ProductPageComponent} />
          </main>

          <footer className="page__footer">
            <p>
              Gemaakt voor de Lutjebroeker Parochieveiling 2021
            </p>
          </footer>
        </Router>
      </ApolloProvider>
    </div>
  );
}

export default App;
