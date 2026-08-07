# Front Office Manager

Simulador de General Manager de basquete inspirado na profundidade de Football Manager.

## Estado atual

Protótipo de fundação. O foco desta versão é provar o loop central:

**Inbox → informação → Continuar → evento → consequência**

Ainda não é uma simulação completa de NBA.

## Rodar localmente

Pré-requisito: Node.js instalado.

```bash
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite no terminal.

## Estrutura

```text
src/
  data/        dados estáticos e seeds
  domain/      tipos e regras centrais
  services/    simulação, save e serviços
  styles/      interface
  App.tsx      shell atual do jogo

docs/
  VISION.md    Documento Zero
  ROADMAP.md   plano incremental
```

## Princípio de desenvolvimento

Nenhuma feature entra apenas por parecer legal. Ela precisa reforçar a fantasia de ser GM e conversar com os demais sistemas.
