import React, { useState, useEffect } from "react";

import whiteLogo from "../assets/img/white-logo.png";
import salesIcon from "../assets/img/sales-icon.png";
import dashboardIcon from "../assets/img/dashboard-icon.png";
import inventoryIcon from "../assets/img/inventory-icon.png";
import secureIcon from "../assets/img/secure-icon.png";
import interfaceIcon from "../assets/img/interface-icon.png";
import cashflowIcon from "../assets/img/cashflow-icon.png";
import aboutBgImage from "../assets/img/new-data-services.jpg";
import { Link } from 'react-router-dom';


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
      <header
        className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-[#4A4E9D] shadow-lg" : "bg-transparent"
        }`}
      >
        <nav className="container mx-auto px-5 py-4 flex justify-between items-center">
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <ul className="flex items-center gap-10">
              <li>
                <a
                  href="#inicio"
                  className="text-white font-medium hover:text-[#8A5CF5] transition-colors"
                >
                  Início
                </a>
              </li>
              <li>
                <a
                  href="#recursos"
                  className="text-white font-medium hover:text-[#8A5CF5] transition-colors"
                >
                  Recursos
                </a>
              </li>
              <li>
                <a
                  href="#sobre"
                  className="text-white font-medium hover:text-[#8A5CF5] transition-colors"
                >
                  Sobre
                </a>
              </li>
            </ul>
          </div>
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <Link
              to="/login"
              className="px-5 py-2 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-[#2A2D5C] transition-all"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 bg-[#8A5CF5] text-white rounded-lg font-medium hover:bg-[#7b4cdb] transition-all"
            >
              Cadastrar
            </Link>
          </div>
          <div className="md:hidden ml-auto" onClick={handleMenuToggle}>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </div>
        </nav>
        {/* Mobile Menu */}
        <div
          className={`md:hidden ${
            menuActive ? "block" : "hidden"
          } bg-[#4A4E9D] text-center py-5`}
        >
          <ul>
            <li className="mb-4">
              <a href="#inicio" className="text-white font-medium">
                Início
              </a>
            </li>
            <li className="mb-4">
              <a href="#recursos" className="text-white font-medium">
                Recursos
              </a>
            </li>
            <li>
              <a href="#sobre" className="text-white font-medium">
                Sobre
              </a>
            </li>
          </ul>
        </div>
      </header>

      <main>
        <section
          className="min-h-screen flex items-center justify-center text-center pt-20 bg-gradient-to-br from-[#4A4E9D] to-[#2A2D5C]"
          id="inicio"
        >
          <div className="container mx-auto px-5">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <img src={whiteLogo} alt="Logo EzGestor" className="h-48" />
              </div>
              <p className="text-xl max-w-xl text-[#E0E0E0]">
                Controle vendas, estoque, fluxo de caixa e muito mais em uma
                única plataforma.
              </p>
              <div className="flex gap-5 mt-5">
                <Link
                  to="/register"
                  className="px-6 py-2 bg-white text-[#4A4E9D] rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Começar Grátis
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 text-[#333]" id="recursos">
          <div className="container mx-auto px-5">
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-2 text-[#4A4E9D]">
                Recursos
              </h2>
              <p className="text-lg text-[#555] max-w-2xl">
                Nós oferecemos uma gama de serviços para ajudar empresas a
                crescer. Esses serviços incluem:
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="rounded-2xl p-8 flex justify-between items-start min-h-[150px] bg-[#4A4E9D] text-white shadow-lg transition-transform hover:-translate-y-1">
                <h3 className="text-2xl font-medium max-w-[120px]">
                  Gestão de Vendas
                </h3>
                <img
                  src={salesIcon}
                  alt="Ícone Gestão de Vendas"
                  className="max-w-[100px] self-center"
                />
              </div>
              <div className="rounded-2xl p-8 flex justify-between items-start min-h-[150px] bg-white text-[#1E1E1E] border border-gray-200 shadow-lg transition-transform hover:-translate-y-1">
                <h3 className="text-2xl font-medium max-w-[120px]">
                  Dashboard Inteligente
                </h3>
                <img
                  src={dashboardIcon}
                  alt="Ícone Dashboard Inteligente"
                  className="max-w-[100px] self-center"
                />
              </div>
              <div className="rounded-2xl p-8 flex justify-between items-start min-h-[150px] bg-[#1E1E1E] text-white shadow-lg transition-transform hover:-translate-y-1">
                <h3 className="text-2xl font-medium max-w-[120px]">
                  Controle de Estoque
                </h3>
                <img
                  src={inventoryIcon}
                  alt="Ícone Controle de Estoque"
                  className="max-w-[100px] self-center"
                />
              </div>
              <div className="rounded-2xl p-8 flex justify-between items-start min-h-[150px] bg-[#1E1E1E] text-white shadow-lg transition-transform hover:-translate-y-1">
                <h3 className="text-2xl font-medium max-w-[120px]">
                  Seguro e Confiável
                </h3>
                <img
                  src={secureIcon}
                  alt="Ícone Seguro e Confiável"
                  className="max-w-[100px] self-center"
                />
              </div>
              <div className="rounded-2xl p-8 flex justify-between items-start min-h-[150px] bg-[#4A4E9D] text-white shadow-lg transition-transform hover:-translate-y-1">
                <h3 className="text-2xl font-medium max-w-[120px]">
                  Interface Moderna
                </h3>
                <img
                  src={interfaceIcon}
                  alt="Ícone Interface Moderna"
                  className="max-w-[100px] self-center"
                />
              </div>
              <div className="rounded-2xl p-8 flex justify-between items-start min-h-[150px] bg-white text-[#1E1E1E] border border-gray-200 shadow-lg transition-transform hover:-translate-y-1">
                <h3 className="text-2xl font-medium max-w-[120px]">
                  Fluxo de Caixa
                </h3>
                <img
                  src={cashflowIcon}
                  alt="Ícone Fluxo de Caixa"
                  className="max-w-[100px] self-center"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-20 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${aboutBgImage})`,
          }}
          id="sobre"
        >
          <div className="container mx-auto px-5">
            <div className="max-w-xl bg-[#4A4E9D] text-white p-10 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Sobre o EzGestor</h2>
              <p className="leading-relaxed mb-4">
                O EzGestor nasceu da necessidade de simplificar a gestão
                empresarial para pequenas e médias empresas.
              </p>
              <p className="leading-relaxed mb-4">
                Nossa plataforma foi desenvolvida por uma equipe experiente que
                entende os desafios diários dos empreendedores.
              </p>
              <p className="leading-relaxed mb-4">
                Com tecnologia de ponta e interface intuitiva, oferecemos uma
                solução completa que cresce junto com seu negócio.
              </p>
              <p className="leading-relaxed mb-4">
                Desde o controle básico de vendas até relatórios avançados, tudo
                em uma única ferramenta poderosa.
              </p>
              <p className="leading-relaxed">
                Nosso compromisso é fornecer as melhores ferramentas para que
                você possa focar no que realmente importa: fazer seu negócio
                crescer.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1E1E1E] text-gray-400 pt-16">
        <div className="container mx-auto px-5 pb-10 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <a href="#" className="text-2xl font-bold text-white mb-4 block">
              EzGestor
            </a>
            <p className="max-w-xs">
              Simplificando a gestão e potencializando seus dados.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">Produto</h4>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:text-[#8A5CF5] transition-colors">
                  Visão Geral
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-[#8A5CF5] transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8A5CF5] transition-colors">
                  Preços
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">Suporte</h4>
            <ul>
              <li className="mb-2">
                <a href="#" className="hover:text-[#8A5CF5] transition-colors">
                  Ajuda
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="hover:text-[#8A5CF5] transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8A5CF5] transition-colors">
                  Status
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-5">Contato</h4>
            <p className="mb-2">(XX) 9XXXX-XXXX</p>
            <p>contato@ezgestor.com</p>
          </div>
        </div>
        <div className="container mx-auto px-5 py-5 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} EzGestor. Todos os direitos reservados.</p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="ml-5 hover:text-[#8A5CF5] transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="ml-5 hover:text-[#8A5CF5] transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;