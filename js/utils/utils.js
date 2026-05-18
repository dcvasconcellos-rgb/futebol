export function calculatePlayerScore(pass, vision, finish, energy, stamina) {
    // Técnica (Escala de 1 a 5, variando de 0.5 em 0.5): Avaliando Passe/Domínio, Visão de Jogo e Finalização.
    // Condicionamento Físico: Nível de Energia/Velocidade (Peso 1.5) e Resistência (Peso 1.5).
    
    const techScore = (Number(pass) + Number(vision) + Number(finish)) / 3;
    const physScore = (Number(energy) * 1.5 + Number(stamina) * 1.5) / 3; // normalized by total weight 3
    
    // Average
    const finalScore = (techScore + physScore) / 2;
    return finalScore;
}
