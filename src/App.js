import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import {Container, Row, Nav, Navbar, NavbarBrand} from 'react-bootstrap';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import HomeComponent from './pages/HomePage';
import ProductPageComponent from './pages/ProductPage';
import ProductListerComponent from './pages/ProductListerPage';


function App() {
  return (
    <div className="App">
      <Router>
        <Container>
          <Row>
            <Navbar>
              <NavbarBrand>Parochieveiling</NavbarBrand>
              <Nav>
                <Nav.Item>
                  <Nav.Link>
                    <Link to="/">
                     <FontAwesomeIcon icon={faHome} />
                    </Link>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Item><Nav.Link><Link to="/products">Kavels</Link></Nav.Link></Nav.Item>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Item><Nav.Link><Link to="/products">Mijn biedingen</Link></Nav.Link></Nav.Item>
                </Nav.Item>
              </Nav>
            </Navbar>
          </Row>

          <Row>
              <Route path="/" component={HomeComponent} exact />
              <Route path="/products" component={ProductListerComponent} />
              <Route path="/p/:id" component={ProductPageComponent} />
          </Row>
        </Container>
      </Router>
    </div>
  );
}

export default App;
