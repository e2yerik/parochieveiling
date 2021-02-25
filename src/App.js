import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import {Container, Row, Nav, NavItem, Navbar, NavbarBrand} from 'react-bootstrap';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import HomeComponent from './pages/HomePage';
import ProductPageComponent from './pages/ProductPage';
import ProductListerComponent from './pages/ProductListerPage';

function App() {
  return (
    <div fluid className="App">
      <Router>
        <Container>
          <Row>
            <Navbar>
              <NavbarBrand>Parochieveiling</NavbarBrand>
              <Nav>
                <NavItem>
                  <Link to="/">Hoofdpagina</Link>
                  <Link to="/products">Produkten</Link>
                </NavItem>
              </Nav>
            </Navbar>
          </Row>

          <Row>
              <Route path="/" component={HomeComponent} />
              <Route path="/products" component={ProductListerComponent} />
              <Route path="/p/:id" component={ProductPageComponent} />
          </Row>
        </Container>
      </Router>
    </div>
  );
}

export default App;
