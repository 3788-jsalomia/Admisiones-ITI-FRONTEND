

import './App.css'
import FormularioPostulante from './components/FormularioPage'
import SidebarLayout from './components/SidebarLayout'
import logo from './assets/logo.png'

function App() {


  return (
    <SidebarLayout logoSrc={logo} appName="Admisiones ITI">
      <div className="card-themed">
        <FormularioPostulante />
      </div>
    </SidebarLayout>
  )
}

export default App
