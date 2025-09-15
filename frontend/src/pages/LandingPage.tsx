import React, { useState, useEffect } from "react";
import "../LandingPage.css";

import whiteLogo from "../assets/img/white-logo.png";
import salesIcon from "../assets/img/sales-icon.png";
import dashboardIcon from "../assets/img/dashboard-icon.png";
import inventoryIcon from "../assets/img/inventory-icon.png";
import secureIcon from "../assets/img/secure-icon.png";
import interfaceIcon from "../assets/img/interface-icon.png";
import cashflowIcon from "../assets/img/cashflow-icon.png";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuActive, setMenuActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMenuToggle = () => {
    setMenuActive(!menuActive);
  };

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <nav className="nav container">
          <div className={`nav-menu ${menuActive ? "active" : ""}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#inicio" className="nav-link">
                  Início
                </a>
              </li>
              <li className="nav-item">
                <a href="#recursos" className="nav-link">
                  Recursos
                </a>
              </li>
              <li className="nav-item">
                <a href="#sobre" className="nav-link">
                  Sobre
                </a>
              </li>
              <li className="nav-item">
                <a href="#contato" className="nav-link">
                  Contato
                </a>
              </li>
            </ul>
          </div>
          <div className="nav-buttons">
            <a href="#" className="btn btn-secondary">
              Entrar
            </a>
            <a href="#" className="btn btn-primary">
              Cadastrar
            </a>
          </div>
          <div
            className="nav-toggle"
            id="nav-toggle"
            onClick={handleMenuToggle}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="container hero-content">
            <div className="logo-hero">
              <img src={whiteLogo} alt="Logo EzGestor" />
            </div>
            <p>
              Controle vendas, estoque, fluxo de caixa e muito mais em uma única
              plataforma.
            </p>
            <div className="hero-buttons">
              <a href="#" className="btn btn-light">
                Começar Grátis
              </a>
              <a href="#" className="btn btn-outline">
                Já tenho conta
              </a>
            </div>
          </div>
        </section>

        <section className="services" id="recursos">
          <div className="container">
            <div className="services-header">
              <h2>Serviços</h2>
              <p>
                Nós oferecemos uma gama de serviços para ajudar empresas a
                crescer. Esses serviços incluem:
              </p>
            </div>
            <div className="services-grid">
              <div className="card card-blue">
                <h3>Gestão de Vendas</h3>
                <img src={salesIcon} alt="Ícone Gestão de Vendas" />
              </div>
              <div className="card card-white">
                <h3>Dashboard Inteligente</h3>
                <img src={dashboardIcon} alt="Ícone Dashboard Inteligente" />
              </div>
              <div className="card card-dark">
                <h3>Controle de Estoque</h3>
                <img src={inventoryIcon} alt="Ícone Controle de Estoque" />
              </div>
              <div className="card card-dark">
                <h3>Seguro e Confiável</h3>
                <img src={secureIcon} alt="Ícone Seguro e Confiável" />
              </div>
              <div className="card card-blue">
                <h3>Interface Moderna</h3>
                <img src={interfaceIcon} alt="Ícone Interface Moderna" />
              </div>
              <div className="card card-white">
                <h3>Fluxo de Caixa</h3>
                <img src={cashflowIcon} alt="Ícone Fluxo de Caixa" />
              </div>
            </div>
          </div>
        </section>

        <section className="about" id="sobre">
          <div className="container about-container">
            <div className="about-content">
              <h2>Sobre o EzGestor</h2>
              <p>
                O EzGestor nasceu da necessidade de simplificar a gestão
                empresarial para pequenas e médias empresas.
              </p>
              <p>
                Nossa plataforma foi desenvolvida por uma equipe experiente que
                entende os desafios diários dos empreendedores.
              </p>
              <p>
                Com tecnologia de ponta e interface intuitiva, oferecemos uma
                solução completa que cresce junto com seu negócio.
              </p>
              <p>
                Desde o controle básico de vendas até relatórios avançados, tudo
                em uma única ferramenta poderosa.
              </p>
              <p>
                Nosso compromisso é fornecer as melhores ferramentas para que
                você possa focar no que realmente importa: fazer seu negócio
                crescer.
              </p>
            </div>
          </div>
        </section>

        <section className="contact" id="contato">
          <div className="container">
            <h2>Entre em Contato</h2>
            <form className="contact-form">
              <div className="form-group">
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  placeholder="Nome Completo"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  id="assunto"
                  name="assunto"
                  placeholder="Assunto"
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={5}
                  placeholder="Mensagem"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-form">
                Enviar Mensagem
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <span>EzGestor</span>
            </a>
            <p>Simplificando a gestão e potencializando seus dados.</p>
          </div>
          <div className="footer-links">
            <h4>Produto</h4>
            <ul>
              <li>
                <a href="#">Visão Geral</a>
              </li>
              <li>
                <a href="#">Recursos</a>
              </li>
              <li>
                <a href="#">Preços</a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Suporte</h4>
            <ul>
              <li>
                <a href="#">Ajuda</a>
              </li>
              <li>
                <a href="#">Contato</a>
              </li>
              <li>
                <a href="#">Status</a>
              </li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contato</h4>
            <p>(XX) 9XXXX-XXXX</p>
            <p>contato@ezgestor.com</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>&copy; 2024 EzGestor. Todos os direitos reservados.</p>
          <div>
            <a href="#">Política de Privacidade</a>
            <a href="#">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
