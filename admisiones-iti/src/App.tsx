

import './App.css'
import FormularioPostulante from './components/FormularioPage'
import SidebarLayout from './components/SidebarLayout'
import logo2 from '../public/logo-ITI.svg'

function App() {


  return (
    <SidebarLayout logoSrc={logo2} appName="Admisiones ITI">
      <div className="card-themed">
        <FormularioPostulante />
      </div>
    </SidebarLayout>
  )
}

export default App
