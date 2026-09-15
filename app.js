/* =========================================================
   Kalicon Amorim — Engine do Portfólio Interativo
   1. Scroll-Driven Code Typing Engine
   2. Retro Snake Canvas Game (Easter Egg)
   3. Interações da Navbar e Teclado
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initScrollCodeEngine();
  initSnakeGame();
});

/* =========================================================
   1. SCROLL-DRIVEN CODE ENGINE
   ========================================================= */
const PROJECT_SNIPPETS = {
  claravellas: {
    file: 'checkout.js',
    project: 'Claravellas (E-Commerce)',
    status: 'Node.js • Stripe Payments • MongoDB',
    code: `// Claravellas — Checkout Seguro & Automação de Pedidos
import Stripe from 'stripe';
import { Orders } from './db/mongo.js';

export async function processarCheckoutVelas(req, res) {
  const { carrinho, clienteEmail } = req.body;
  
  // Mapeamento dos produtos de luxo e velas personalizadas
  const lineItems = carrinho.map(item => ({
    price_data: {
      currency: 'brl',
      product_data: { 
        name: \`Vela Aromática Claravellas — \${item.aroma}\`,
        description: \`Personalização: \${item.mensagemPersonalizada || 'Padrão'}\`
      },
      unit_amount: item.precoEmCentavos
    },
    quantity: item.quantidade
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'pix'],
    customer_email: clienteEmail,
    line_items: lineItems,
    mode: 'payment',
    success_url: 'https://claravellas-three.vercel.app/sucesso?session={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://claravellas-three.vercel.app/carrinho'
  });

  return res.status(200).json({ sessionId: session.id, checkoutUrl: session.url });
}`
  },

  rhub: {
    file: 'clt_modules.test.js',
    project: 'RHUB (PWA & CLT)',
    status: 'JavaScript ES6 • Vitest • 14 Tests Passed',
    code: `// RHUB — Suíte de Cálculos Trabalhistas & Testes Unitários
import { describe, it, expect } from 'vitest';
import { calcularRescisao } from '../assets/js/modules/rescisao.js';
import { calcularSimulacaoCLTvsPJ } from '../assets/js/modules/clt_pj.js';

describe('Suíte de Engenharia Legal — CLT Brasileira', () => {
  it('calcula rescisão sem justa causa com aviso prévio proporcional', () => {
    const simulacao = calcularRescisao({
      salarioBase: 4200.00,
      mesesTrabalhados: 26,
      motivo: 'sem_justa_causa',
      diasAvisoPrevio: 36 // Lei 12.506 (30 dias base + 3 dias/ano)
    });

    expect(simulacao.avisoPrevioIndenizado).toBeCloseTo(5040.00, 2);
    expect(simulacao.multaFGTS).toBeGreaterThan(0);
    expect(simulacao.totalLiquidoRescisao).toBeDefined();
  });

  it('determina o break-even exato de faturamento PJ vs. poder de compra CLT', () => {
    const comparativo = calcularSimulacaoCLTvsPJ(6000.00, 'simples_nacional_anexo_iii');
    expect(comparativo.faturamentoPJNecessario).toBeGreaterThan(6000.00);
    expect(comparativo.custoEmpresaCLT).toBeGreaterThan(comparativo.salarioLiquidoCLT);
  });
});`
  },

  calculadora: {
    file: 'CompensacaoEscala.java',
    project: 'SES-SP (HMLMB)',
    status: 'Java Core Engine • Algoritmo de Escala Semestral',
    code: `// Hospital Maternidade Leonor Mendes de Barros (SES-SP)
// Algoritmo de Compensação para Jornadas Reduzidas (TEA 20% / 30h)
package com.hospital.escalas;

public class CompensacaoEscalaEngine {
    private static final double SEMANAS_MES = 4.3;

    public static CronogramaSemestral calcularCompensacao(int horasSemanais, int minutosPlantao) {
        // Ex: 24h semanais (30h com redução TEA 20%) -> 103h12min mensais
        int minutosAlvoMensais = (int) Math.round(horasSemanais * 60 * SEMANAS_MES);
        int saldoMinutosAcumulado = 0;
        CronogramaSemestral cronograma = new CronogramaSemestral();

        for (int mes = 1; mes <= 6; mes++) {
            // Alternância automática entre 11 plantões e 10 plantões
            int plantoes = (mes == 2 || mes == 6) ? 10 : 11;
            int minutosRealizados = plantoes * minutosPlantao;
            saldoMinutosAcumulado += (minutosRealizados - minutosAlvoMensais);

            // No Mês 4 o banco de horas atinge o equilíbrio exato (00:00)
            cronograma.adicionarMes(mes, plantoes, saldoMinutosAcumulado);
        }
        return cronograma;
    }
}`
  },

  intrahub: {
    file: 'EscalaController.java',
    project: 'IntraHub (Enterprise)',
    status: 'Java 17 • Spring Boot 3 • Spring Security RBAC',
    code: `// IntraHub — Portal Corporativo & Rastreabilidade de Escalas
package com.example.demo.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/escalas")
public class EscalaController {

    private final EscalaService escalaService;
    private final AuditLogger auditLogger;

    @PostMapping("/replicar-lote")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<ReplicacaoResponse> replicarSemanalmente(
            @Valid @RequestBody ReplicacaoDTO request,
            @AuthenticationPrincipal UserDetails usuarioAutenticado) {

        // Auditoria imutável de compliance para rastreabilidade corporativa
        auditLogger.registrar(usuarioAutenticado.getUsername(), "REPLICACAO_LOTE_ESCALA", request);
        
        ReplicacaoResponse response = escalaService.executarReplicacaoSemanal(request);
        return ResponseEntity.ok(response);
    }
}`
  }
};

function initScrollCodeEngine() {
  const cards = document.querySelectorAll('.scroll-step-card');
  const codeOutput = document.getElementById('codeOutput');
  const lineNumbers = document.getElementById('lineNumbers');
  const ideFileName = document.getElementById('ideFileName');
  const ideProjectBadge = document.getElementById('ideProjectBadge');
  const ideStatusText = document.getElementById('ideStatusText');

  let currentStep = null;
  let typingTimer = null;

  function setCodeSnippet(stepKey, animate = true) {
    if (currentStep === stepKey) return;
    currentStep = stepKey;

    const data = PROJECT_SNIPPETS[stepKey];
    if (!data) return;

    ideFileName.textContent = data.file;
    ideProjectBadge.textContent = data.project;
    ideStatusText.textContent = data.status;

    // Atualiza classes ativas nos cards
    cards.forEach(card => {
      if (card.getAttribute('data-step') === stepKey) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (typingTimer) clearTimeout(typingTimer);

    if (!animate) {
      codeOutput.textContent = data.code;
      updateLineNumbers(data.code);
      return;
    }

    // Efeito de digitação acelerada e realista
    codeOutput.textContent = '';
    const fullText = data.code;
    let charIndex = 0;
    const speed = 12; // Velocidade fluida

    function typeChar() {
      // Digita em blocos para performance
      const chunkSize = 4;
      const nextChunk = fullText.slice(charIndex, charIndex + chunkSize);
      codeOutput.textContent += nextChunk;
      charIndex += chunkSize;
      updateLineNumbers(codeOutput.textContent);

      if (charIndex < fullText.length) {
        typingTimer = setTimeout(typeChar, speed);
      }
    }

    typeChar();
  }

  function updateLineNumbers(text) {
    const linesCount = text.split('\n').length;
    let linesHtml = '';
    for (let i = 1; i <= Math.max(linesCount, 15); i++) {
      linesHtml += `<div>${i}</div>`;
    }
    lineNumbers.innerHTML = linesHtml;
  }

  // Inicializa com o primeiro projeto (Claravellas)
  setCodeSnippet('claravellas', false);

  // IntersectionObserver para detectar o scroll nos cards
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -40% 0px',
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = entry.target.getAttribute('data-step');
        setCodeSnippet(step, true);
      }
    });
  }, observerOptions);

  cards.forEach(card => observer.observe(card));
}

/* =========================================================
   2. RETRO COMMITS SNAKE GAME (EASTER EGG)
   ========================================================= */
function initSnakeGame() {
  const modal = document.getElementById('snakeModal');
  const btnOpen = document.getElementById('btnOpenSnake');
  const btnFooterOpen = document.getElementById('btnFooterSnake');
  const btnClose = document.getElementById('btnCloseSnake');
  const btnRestart = document.getElementById('btnRestartGame');
  const btnPause = document.getElementById('btnPauseGame');
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  
  const scoreDisplay = document.getElementById('snakeScore');
  const highScoreDisplay = document.getElementById('snakeHighScore');
  const commitsDisplay = document.getElementById('snakeCommits');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreDisplay = document.getElementById('finalScore');

  const GRID_SIZE = 20; // 20x20 blocos de 20px
  const TILE_SIZE = canvas.width / GRID_SIZE;

  let snake = [];
  let food = { x: 5, y: 5 };
  let dx = 1;
  let dy = 0;
  let score = 0;
  let commitsEaten = 0;
  let highScore = localStorage.getItem('kalicon_snake_highscore') || 0;
  let gameInterval = null;
  let isGameOver = false;
  let isPaused = false;

  highScoreDisplay.textContent = highScore;

  function openModal() {
    modal.classList.add('active');
    resetGame();
  }

  function closeModal() {
    modal.classList.remove('active');
    stopGame();
  }

  btnOpen.addEventListener('click', openModal);
  if (btnFooterOpen) btnFooterOpen.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  btnRestart.addEventListener('click', resetGame);

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Tecla 'S' de atalho para abrir o jogo
  window.addEventListener('keydown', (e) => {
    if ((e.key === 's' || e.key === 'S') && !modal.classList.contains('active') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      openModal();
    }
  });

  function resetGame() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    dx = 1;
    dy = 0;
    score = 0;
    commitsEaten = 0;
    isGameOver = false;
    isPaused = false;
    scoreDisplay.textContent = '0';
    commitsDisplay.textContent = '0';
    gameOverOverlay.classList.remove('active');

    spawnFood();
    stopGame();
    gameInterval = setInterval(gameLoop, 110);
  }

  function stopGame() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = null;
  }

  function spawnFood() {
    let valid = false;
    while (!valid) {
      food.x = Math.floor(Math.random() * GRID_SIZE);
      food.y = Math.floor(Math.random() * GRID_SIZE);
      valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
  }

  function gameLoop() {
    if (isPaused || isGameOver) return;

    // Movimentação da cabeça
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Colisão com paredes (Wrap-around / Modo infinito amigável)
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;

    // Colisão consigo mesma
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }

    snake.unshift(head);

    // Comeu o commit
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      commitsEaten++;
      scoreDisplay.textContent = score;
      commitsDisplay.textContent = commitsEaten;

      if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('kalicon_snake_highscore', highScore);
      }

      spawnFood();
    } else {
      snake.pop();
    }

    drawGame();
  }

  function drawGame() {
    // Fundo escuro estilo GitHub Terminal
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Desenha o Commit (Comida) com brilho verde neon
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#10B981';
    ctx.fillStyle = '#10B981';
    ctx.fillRect(food.x * TILE_SIZE + 2, food.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);

    // Desenha a Cobrinha (Tema Azul Ciano Elétrico)
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#38BDF8';
    snake.forEach((segment, index) => {
      ctx.fillStyle = (index === 0) ? '#38BDF8' : '#0284C7';
      ctx.fillRect(segment.x * TILE_SIZE + 2, segment.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    });

    ctx.shadowBlur = 0; // Reset de sombra
  }

  function handleGameOver() {
    isGameOver = true;
    stopGame();
    finalScoreDisplay.textContent = score;
    gameOverOverlay.classList.add('active');
  }

  // Controles de Teclado
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (dy !== 1) { dx = 0; dy = -1; }
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (dy !== -1) { dx = 0; dy = 1; }
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (dx !== 1) { dx = -1; dy = 0; }
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (dx !== -1) { dx = 1; dy = 0; }
        e.preventDefault();
        break;
      case ' ': // Barra de espaço pausa
        isPaused = !isPaused;
        e.preventDefault();
        break;
      case 'Escape':
        closeModal();
        break;
    }
  });

  // Controles de Toque (Mobile D-Pad)
  const dpadBtns = document.querySelectorAll('.dpad-btn[data-dir]');
  dpadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const dir = btn.getAttribute('data-dir');
      if (dir === 'UP' && dy !== 1) { dx = 0; dy = -1; }
      if (dir === 'DOWN' && dy !== -1) { dx = 0; dy = 1; }
      if (dir === 'LEFT' && dx !== 1) { dx = -1; dy = 0; }
      if (dir === 'RIGHT' && dx !== -1) { dx = 1; dy = 0; }
    });
  });

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      isPaused = !isPaused;
      btnPause.textContent = isPaused ? '▶' : '⏸';
    });
  }
}
