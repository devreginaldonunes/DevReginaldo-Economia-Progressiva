let goalData = {};
        let currentMonthIndex = 0;
        let completedMonths = [];
        let streak = 0;

        // Initialize
        document.getElementById('startDate').value = new Date().toISOString().split('T')[0];

        function setQuickGoal(amount, duration) {
            document.getElementById('goalAmount').value = amount;
            document.getElementById('duration').value = duration;
            document.getElementById('goalName').value = amount === 500 ? 'Meta Rápida' :
                amount === 1200 ? 'Meta Popular' : 'Meta Ambiciosa';
        }

        function setupGoal() {
            const goalAmount = parseFloat(document.getElementById('goalAmount').value);
            const duration = parseInt(document.getElementById('duration').value);
            const startDate = new Date(document.getElementById('startDate').value);
            const goalName = document.getElementById('goalName').value || 'Minha Meta';

            if (!goalAmount || !duration || goalAmount <= 0 || duration <= 0) {
                showNotification('Por favor, preencha todos os campos com valores válidos!', 'error');
                return;
            }

            goalData = {
                name: goalName,
                totalGoal: goalAmount,
                duration: duration,
                startDate: startDate,
                monthlyAmounts: calculateProgressiveAmounts(goalAmount, duration),
                createdAt: new Date()
            };

            currentMonthIndex = 0;
            completedMonths = [];
            streak = 0;

            saveData();
            showProgressSection();
            updateDisplay();
            showNotification('Meta configurada com sucesso! 🎉', 'success');
        }

        function calculateProgressiveAmounts(total, months) {
            const amounts = [];
            const sum = months * (months + 1) / 2;
            const baseAmount = total / sum;

            for (let i = 1; i <= months; i++) {
                amounts.push(Math.round(baseAmount * i * 100) / 100);
            }

            return amounts;
        }

        function showProgressSection() {
            document.getElementById('setupSection').style.display = 'none';
            document.getElementById('progressSection').style.display = 'block';
            document.getElementById('floatingBtn').classList.remove('hidden');
        }

        function updateDisplay() {
            const totalSaved = completedMonths.reduce((sum, month) => sum + goalData.monthlyAmounts[month], 0);
            const progressPercentage = (totalSaved / goalData.totalGoal) * 100;

            // Update hero stats
            document.getElementById('totalSaved').textContent = formatCurrency(totalSaved);
            document.getElementById('goalDisplay').textContent = `de ${formatCurrency(goalData.totalGoal)}`;
            document.getElementById('progressFill').style.width = Math.min(progressPercentage, 100) + '%';
            document.getElementById('progressPercentage').textContent = Math.round(progressPercentage) + '%';
            document.getElementById('completedMonths').textContent = completedMonths.length;
            document.getElementById('remainingMonths').textContent = `de ${goalData.duration}`;

            const averageMonthly = completedMonths.length > 0 ? totalSaved / completedMonths.length : 0;
            document.getElementById('averageMonthly').textContent = formatCurrency(averageMonthly);
            document.getElementById('streakCounter').textContent = `Sequência: ${streak}`;

            // Update current month
            if (currentMonthIndex < goalData.monthlyAmounts.length) {
                const monthDate = new Date(goalData.startDate);
                monthDate.setMonth(monthDate.getMonth() + currentMonthIndex);
                const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

                document.getElementById('currentAmount').textContent = formatCurrency(goalData.monthlyAmounts[currentMonthIndex]);
                document.getElementById('currentMonthName').textContent = `${monthName} • Mês ${currentMonthIndex + 1}`;
                document.getElementById('markCompleteBtn').disabled = false;
            } else {
                document.getElementById('currentMonth').innerHTML = `
                    <h3><i class="fas fa-trophy"></i> Meta Concluída!</h3>
                    <div class="current-amount">🎉 Parabéns!</div>
                    <p>Você economizou ${formatCurrency(goalData.totalGoal)} em ${goalData.duration} meses!</p>
                `;
            }

            updateTimeline();
            updateAchievements();
            updateInsights();
        }

        function updateTimeline() {
            const timeline = document.getElementById('timeline');
            timeline.innerHTML = '';

            goalData.monthlyAmounts.forEach((amount, index) => {
                const item = document.createElement('div');
                item.className = 'timeline-item';

                if (completedMonths.includes(index)) {
                    item.classList.add('completed');
                } else if (index === currentMonthIndex) {
                    item.classList.add('current');
                }

                const monthDate = new Date(goalData.startDate);
                monthDate.setMonth(monthDate.getMonth() + index);
                const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short' });

                const statusIcon = completedMonths.includes(index) ? 'fa-check' :
                    index === currentMonthIndex ? 'fa-clock' : 'fa-circle';

                item.innerHTML = `
                    <div class="timeline-status">
                        <i class="fas ${statusIcon}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-month">Mês ${index + 1} • ${monthName}</div>
                        <div class="timeline-amount">${formatCurrency(amount)}</div>
                    </div>
                `;

                timeline.appendChild(item);
            });
        }

        function updateAchievements() {
            const achievements = document.getElementById('achievements');
            achievements.innerHTML = '';

            const totalSaved = completedMonths.reduce((sum, month) => sum + goalData.monthlyAmounts[month], 0);
            const completedCount = completedMonths.length;
            const progressPercentage = (totalSaved / goalData.totalGoal) * 100;

            const achievementsList = [
                { condition: completedCount >= 1, text: 'Primeira Economia!', icon: 'fa-star' },
                { condition: completedCount >= 3, text: '3 Meses Consistentes', icon: 'fa-fire' },
                { condition: progressPercentage >= 10, text: '10% Concluído', icon: 'fa-percentage' },
                { condition: progressPercentage >= 25, text: '¼ do Caminho', icon: 'fa-chart-pie' },
                { condition: progressPercentage >= 50, text: 'Meio Caminho!', icon: 'fa-mountain' },
                { condition: progressPercentage >= 75, text: '75% Atingido', icon: 'fa-medal' },
                { condition: streak >= 3, text: `${streak} Meses Seguidos`, icon: 'fa-bolt' },
                { condition: completedCount >= goalData.duration, text: 'Meta 100% Completa!', icon: 'fa-trophy' }
            ];

            const unlockedAchievements = achievementsList.filter(achievement => achievement.condition);

            if (unlockedAchievements.length === 0) {
                achievements.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-trophy"></i>
                        <p>Complete seu primeiro mês para desbloquear conquistas!</p>
                    </div>
                `;
                return;
            }

            unlockedAchievements.forEach(achievement => {
                const div = document.createElement('div');
                div.className = 'achievement';
                div.innerHTML = `
                    <div class="achievement-icon">
                        <i class="fas ${achievement.icon}"></i>
                    </div>
                    <div class="achievement-text">${achievement.text}</div>
                `;
                achievements.appendChild(div);
            });
        }

        function updateInsights() {
            const insightText = document.getElementById('insightText');
            const totalSaved = completedMonths.reduce((sum, month) => sum + goalData.monthlyAmounts[month], 0);
            const completedCount = completedMonths.length;
            const progressPercentage = (totalSaved / goalData.totalGoal) * 100;

            let insight = '';

            if (completedCount === 0) {
                insight = 'Complete seu primeiro mês para receber insights personalizados sobre seu progresso.';
            } else if (completedCount < 3) {
                insight = `Excelente início! Você já economizou ${formatCurrency(totalSaved)}. Continue assim para criar um hábito sólido de poupança.`;
            } else if (progressPercentage < 50) {
                const monthsAhead = completedMonths.filter(m => m < currentMonthIndex).length;
                const efficiency = (totalSaved / (currentMonthIndex + 1)) * 100;
                insight = `Você está ${efficiency > 80 ? 'muito bem' : 'no caminho certo'}! ${monthsAhead > 0 ? `Está ${monthsAhead} ${monthsAhead === 1 ? 'mês' : 'meses'} adiantado.` : ''} Faltam ${formatCurrency(goalData.totalGoal - totalSaved)} para sua meta.`;
            } else {
                const remainingMonths = goalData.duration - completedCount;
                const avgNeeded = remainingMonths > 0 ? (goalData.totalGoal - totalSaved) / remainingMonths : 0;
                insight = `Incrível progresso! Você já passou da metade da meta. Para os próximos ${remainingMonths} meses, precisará economizar em média ${formatCurrency(avgNeeded)} por mês.`;
            }

            insightText.textContent = insight;
        }

        function markMonthCompleted() {
            if (currentMonthIndex >= goalData.monthlyAmounts.length) {
                showNotification('Todos os meses já foram concluídos!', 'info');
                return;
            }

            if (completedMonths.includes(currentMonthIndex)) {
                showNotification('Este mês já foi marcado como concluído!', 'info');
                return;
            }

            completedMonths.push(currentMonthIndex);
            completedMonths.sort((a, b) => a - b);

            // Update streak
            updateStreak();

            // Find next incomplete month
            currentMonthIndex++;
            while (currentMonthIndex < goalData.monthlyAmounts.length && completedMonths.includes(currentMonthIndex)) {
                currentMonthIndex++;
            }

            saveData();
            updateDisplay();
            showNotification('Mês marcado como concluído! 🎉', 'success');

            // Check if goal is complete
            if (completedMonths.length >= goalData.duration) {
                setTimeout(() => {
                    showNotification('🏆 Parabéns! Meta 100% concluída!', 'success');
                }, 1000);
            }
        }

        function updateStreak() {
            streak = 0;
            const sortedCompleted = [...completedMonths].sort((a, b) => a - b);

            for (let i = 0; i < sortedCompleted.length; i++) {
                if (i === 0 || sortedCompleted[i] === sortedCompleted[i - 1] + 1) {
                    streak++;
                } else {
                    streak = 1;
                }
            }
        }

        function editGoal() {
            document.getElementById('newGoalAmount').value = goalData.totalGoal;
            document.getElementById('newDuration').value = goalData.duration;
            document.getElementById('newGoalName').value = goalData.name;
            document.getElementById('editModal').style.display = 'block';
        }

        function updateGoal() {
            const newGoal = parseFloat(document.getElementById('newGoalAmount').value);
            const newDuration = parseInt(document.getElementById('newDuration').value);
            const newName = document.getElementById('newGoalName').value;

            if (!newGoal || !newDuration || newGoal <= 0 || newDuration <= 0) {
                showNotification('Por favor, insira valores válidos!', 'error');
                return;
            }

            goalData.name = newName || goalData.name;
            goalData.totalGoal = newGoal;
            goalData.duration = newDuration;
            goalData.monthlyAmounts = calculateProgressiveAmounts(newGoal, newDuration);

            // Adjust completed months if duration changed
            completedMonths = completedMonths.filter(month => month < newDuration);
            if (currentMonthIndex >= newDuration) {
                currentMonthIndex = newDuration - 1;
            }

            saveData();
            updateDisplay();
            closeModal();
            showNotification('Meta atualizada com sucesso!', 'success');
        }

        function viewAnalytics() {
            const totalSaved = completedMonths.reduce((sum, month) => sum + goalData.monthlyAmounts[month], 0);
            const progressPercentage = (totalSaved / goalData.totalGoal) * 100;
            const avgMonthly = completedMonths.length > 0 ? totalSaved / completedMonths.length : 0;
            const projectedCompletion = calculateProjectedCompletion();

            const analyticsContent = document.getElementById('analyticsContent');
            analyticsContent.innerHTML = `
                <div class="hero-stats" style="margin-bottom: 2rem;">
                    <div class="stat-card">
                        <div class="stat-value">${Math.round(progressPercentage)}%</div>
                        <div class="stat-label">Taxa de Progresso</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${completedMonths.length}/${goalData.duration}</div>
                        <div class="stat-label">Meses Concluídos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatCurrency(avgMonthly)}</div>
                        <div class="stat-label">Média Mensal</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${streak}</div>
                        <div class="stat-label">Maior Sequência</div>
                    </div>
                </div>

                <div style="background: var(--light); padding: 1.5rem; border-radius: var(--radius); margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 1rem;"><i class="fas fa-calendar-alt"></i> Projeção de Conclusão</h4>
                    <p>${projectedCompletion}</p>
                </div>

                <div style="background: var(--light); padding: 1.5rem; border-radius: var(--radius);">
                    <h4 style="margin-bottom: 1rem;"><i class="fas fa-lightbulb"></i> Recomendações</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${generateRecommendations().map(rec => `<li style="margin-bottom: 0.5rem;"><i class="fas fa-check" style="color: var(--primary); margin-right: 0.5rem;"></i>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;

            document.getElementById('analyticsModal').style.display = 'block';
        }

        function calculateProjectedCompletion() {
            const remainingMonths = goalData.duration - completedMonths.length;
            if (remainingMonths <= 0) {
                return 'Meta já concluída! 🎉';
            }

            const currentDate = new Date();
            const projectedDate = new Date(currentDate);
            projectedDate.setMonth(projectedDate.getMonth() + remainingMonths);

            return `Baseado no seu ritmo atual, você deve concluir sua meta em ${projectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} (${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'} restantes).`;
        }

        function generateRecommendations() {
            const recommendations = [];
            const completedCount = completedMonths.length;
            const progressPercentage = (completedMonths.reduce((sum, month) => sum + goalData.monthlyAmounts[month], 0) / goalData.totalGoal) * 100;

            if (completedCount === 0) {
                recommendations.push('Comece marcando seu primeiro mês como concluído');
                recommendations.push('Configure lembretes mensais para não esquecer');
            } else if (completedCount < 3) {
                recommendations.push('Foque em criar consistência nos próximos meses');
                recommendations.push('Considere automatizar suas economias');
            } else if (progressPercentage < 50) {
                recommendations.push('Você está no caminho certo! Continue assim');
                recommendations.push('Considere aumentar o valor se possível');
            } else {
                recommendations.push('Excelente progresso! Você já passou da metade');
                recommendations.push('Mantenha o foco até o final');
            }

            recommendations.push('Compartilhe seu progresso com amigos para mais motivação');
            recommendations.push('Celebre cada marco atingido');

            return recommendations;
        }

        function shareProgress() {
            const totalSaved = completedMonths.reduce((sum, month) => sum + goalData.monthlyAmounts[month], 0);
            const progressPercentage = Math.round((totalSaved / goalData.totalGoal) * 100);

            const shareText = `🎯 Estou na jornada da Economia Progressiva!\n\n💰 Meta: ${formatCurrency(goalData.totalGoal)}\n📈 Progresso: ${progressPercentage}% (${formatCurrency(totalSaved)})\n🗓️ ${completedMonths.length}/${goalData.duration} meses concluídos\n\n#EconomiaProgressiva #MetasFinanceiras`;

            if (navigator.share) {
                navigator.share({
                    title: 'Meu Progresso - Economia Progressiva',
                    text: shareText
                });
            } else {
                navigator.clipboard.writeText(shareText);
                showNotification('Progresso copiado para área de transferência!', 'success');
            }
        }

        function exportData() {
            const totalSaved = completedMonths.reduce((sum, month) => sum + goalData.monthlyAmounts[month], 0);
            const progressPercentage = (totalSaved / goalData.totalGoal) * 100;

            const reportData = {
                meta: {
                    nome: goalData.name,
                    valorTotal: goalData.totalGoal,
                    duracao: goalData.duration,
                    dataInicio: goalData.startDate.toISOString().split('T')[0],
                    criadoEm: goalData.createdAt
                },
                progresso: {
                    totalEconomizado: totalSaved,
                    porcentagem: Math.round(progressPercentage),
                    mesesConcluidos: completedMonths.length,
                    sequencia: streak,
                    mediaMensal: completedMonths.length > 0 ? totalSaved / completedMonths.length : 0
                },
                cronograma: goalData.monthlyAmounts.map((amount, index) => ({
                    mes: index + 1,
                    valor: amount,
                    concluido: completedMonths.includes(index),
                    data: new Date(goalData.startDate.getFullYear(), goalData.startDate.getMonth() + index).toISOString().split('T')[0]
                })),
                relatorioGerado: new Date().toISOString()
            };

            const jsonString = JSON.stringify(reportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `economia_progressiva_${goalData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            showNotification('Dados exportados com sucesso!', 'success');
        }

        function quickAddSaving() {
            if (currentMonthIndex < goalData.monthlyAmounts.length && !completedMonths.includes(currentMonthIndex)) {
                markMonthCompleted();
            }
        }

        function resetGoal() {
            if (confirm('⚠️ Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
                localStorage.removeItem('economiaProgressivaData');
                location.reload();
            }
        }

        function closeModal() {
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('analyticsModal').style.display = 'none';
        }

        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notificationText');

            notificationText.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        }

        function saveData() {
            const data = {
                goalData,
                currentMonthIndex,
                completedMonths,
                streak
            };
            localStorage.setItem('economiaProgressivaData', JSON.stringify(data));
        }

        function loadData() {
            const saved = localStorage.getItem('economiaProgressivaData');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    goalData = data.goalData;
                    goalData.startDate = new Date(goalData.startDate);
                    goalData.createdAt = new Date(goalData.createdAt);
                    currentMonthIndex = data.currentMonthIndex || 0;
                    completedMonths = data.completedMonths || [];
                    streak = data.streak || 0;

                    showProgressSection();
                    updateDisplay();
                } catch (error) {
                    console.error('Error loading data:', error);
                    localStorage.removeItem('economiaProgressivaData');
                }
            }
        }

        // Event listeners
        window.onclick = function (event) {
            const editModal = document.getElementById('editModal');
            const analyticsModal = document.getElementById('analyticsModal');
            if (event.target === editModal) {
                closeModal();
            }
            if (event.target === analyticsModal) {
                closeModal();
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeModal();
            }
            if (event.ctrlKey && event.key === 'm') {
                event.preventDefault();
                if (document.getElementById('progressSection').style.display !== 'none') {
                    quickAddSaving();
                }
            }
        });

        // Load data on startup
        loadData();