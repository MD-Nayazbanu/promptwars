/**
 * StudyGenius AI - Smart Study Planner Logic
 * Implements priority formulas, edge-case intelligence, and UX transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('plannerForm');
    const dashboardSection = document.getElementById('dashboardSection');
    const scheduleTimeline = document.getElementById('scheduleTimeline');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    // AI Strategy & Insights
    const timeWarningBanner = document.getElementById('timeWarningBanner');
    const dynamicRecommendation = document.getElementById('dynamicRecommendation');
    const decisionLog = document.getElementById('decisionLog');
    const insightsList = document.getElementById('insightsList');

    // Action Buttons
    const optimizeBtn = document.getElementById('optimizeBtn');
    const exportBtn = document.getElementById('exportBtn');
    const exportCalendarBtn = document.getElementById('exportCalendarBtn');
    const simulateSkipBtn = document.getElementById('simulateSkipBtn');
    const toast = document.getElementById('toast');
    const simulationBanner = document.getElementById('simulationBanner');
    
    // Modal
    const howItWorksBtn = document.getElementById('howItWorksBtn');
    const infoModal = document.getElementById('infoModal');
    const closeModal = document.querySelector('.close-modal');

    // --- State ---
    let currentInputData = null;
    let generatedPlanData = [];
    let isOptimized = false;
    let simulationDaysSkipped = 0;

    // Set minimum exam date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('examDate').min = tomorrow.toISOString().split('T')[0];

    // --- Event Listeners ---
    form.addEventListener('submit', handleFormSubmit);
    optimizeBtn.addEventListener('click', handleOptimize);
    exportBtn.addEventListener('click', exportPlan);
    exportCalendarBtn.addEventListener('click', exportCalendar);
    simulateSkipBtn.addEventListener('click', handleSimulateSkip);
    
    // Modal handling
    howItWorksBtn.addEventListener('click', () => infoModal.classList.add('show'));
    closeModal.addEventListener('click', () => infoModal.classList.remove('show'));
    window.addEventListener('click', (e) => { if (e.target === infoModal) infoModal.classList.remove('show'); });

    // --- Main Logic ---

    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Basic validation reset
        document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));
        timeWarningBanner.style.display = 'none';
        
        const examDateVal = document.getElementById('examDate').value;
        const subjectsVal = document.getElementById('subjects').value;
        const weakTopicsVal = document.getElementById('weakTopics').value;
        const studyHoursVal = document.getElementById('studyHours').value;
        const preferredTimeVal = document.getElementById('preferredTime').value;

        const parsedSubjects = subjectsVal.split(',').map(s => s.trim()).filter(s => s);

        if (!examDateVal || parsedSubjects.length === 0 || !studyHoursVal || !preferredTimeVal) {
            showToast("Please fill in all required fields properly.", true);
            return;
        }

        // Save input state
        currentInputData = {
            examDate: new Date(examDateVal),
            subjects: parsedSubjects,
            weakTopics: weakTopicsVal.split(',').map(s => s.trim().toLowerCase()).filter(s => s),
            dailyHours: parseFloat(studyHoursVal),
            preferredTime: preferredTimeVal
        };

        isOptimized = false; // Reset optimization state
        simulationDaysSkipped = 0; // Reset simulation
        optimizeBtn.style.display = 'inline-flex';
        optimizeBtn.innerHTML = `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Optimize Plan`;

        executeAIPlanningSequence("Analyzing your schedule...");
    }

    function handleOptimize() {
        if (!currentInputData) return;
        
        // Optimization Logic: 
        // AI decides to increase daily hours slightly (if < 12) to fit more,
        // and aggressively prioritize weak subjects by filtering out strong ones if time is tight.
        
        isOptimized = true;
        if (currentInputData.dailyHours < 8) {
            currentInputData.dailyHours += 1; // AI suggestion: study 1 more hour
        }
        
        executeAIPlanningSequence("AI is optimizing your schedule for maximum retention...", true);
        
        optimizeBtn.innerHTML = `✨ Plan Optimized`;
        optimizeBtn.style.pointerEvents = 'none';
        optimizeBtn.style.opacity = '0.7';
    }

    function handleSimulateSkip() {
        if (!currentInputData) return;
        simulationDaysSkipped++;
        executeAIPlanningSequence("Simulating procrastination...", false);
    }

    function executeAIPlanningSequence(loadingMsg, optimized = false) {
        loadingText.textContent = loadingMsg;
        loadingOverlay.classList.add('active');
        
        // Hide dashboard temporarily for smooth transition
        dashboardSection.style.opacity = '0';
        dashboardSection.style.display = 'block';

        // Simulate AI Processing Time
        setTimeout(() => {
            try {
                const { plan, analysisData } = generateSmartStudyPlan(currentInputData, optimized);
                renderDashboard(plan, analysisData);
                
                dashboardSection.style.opacity = '1';
                
                if (optimized) {
                    showToast("Schedule optimized successfully!");
                } else {
                    dashboardSection.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (error) {
                console.error("AI Generation Error:", error);
                dashboardSection.style.display = 'none';
                showToast("Failed to generate plan. Please try again.", true);
            } finally {
                loadingOverlay.classList.remove('active');
            }
        }, 1200);
    }

    /**
     * AI Core: Calculates Priority Scores and generates the plan
     */
    function generateSmartStudyPlan(data, isOptimizedMode) {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // 1. Core Metrics
        const timeDiff = data.examDate.getTime() - today.getTime();
        let totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1 - simulationDaysSkipped; 
        if (totalDays < 0) totalDays = 0;
        const totalAvailableHours = totalDays * data.dailyHours;

        const analysis = {
            totalDays,
            totalAvailableHours,
            dailyHours: data.dailyHours,
            subjects: data.subjects,
            weakTopics: data.weakTopics,
            isUrgent: totalDays <= 7,
            isExtremeUrgency: totalDays <= 3,
            isInsufficientTime: false,
            decisionsLog: [],
            insights: []
        };

        // 2. Compute Priority Scores (Formula: (Urgency × 2) + Weakness + Time Constraint)
        let minRequiredHours = 0;
        let priorityScores = data.subjects.map(sub => {
            const isWeak = data.weakTopics.some(weak => sub.toLowerCase().includes(weak));
            
            // Formula components
            const urgencyFactor = analysis.isExtremeUrgency ? 5 : (analysis.isUrgent ? 3 : 1);
            const weaknessScore = isWeak ? 10 : 0;
            
            minRequiredHours += (isWeak ? 5 : 3); // Base heuristic needed

            return {
                name: sub,
                isWeak: isWeak,
                urgencyVal: urgencyFactor,
                weaknessVal: weaknessScore,
                score: 0, // Calculated after time constraint check
                reason: ""
            };
        });

        // Check constraints
        const timeConstraintPenalty = (totalAvailableHours > 0 && totalAvailableHours < minRequiredHours) ? 10 : 0;
        if (timeConstraintPenalty > 0) {
            analysis.isInsufficientTime = true;
        }

        // Finalize Scores
        priorityScores.forEach(sub => {
            sub.score = (sub.urgencyVal * 2) + sub.weaknessVal + (sub.isWeak ? timeConstraintPenalty : 0);
            
            // Risk Scoring Calculation
            sub.riskPercent = Math.min(99, Math.max(5, Math.floor((sub.score / 25) * 100)));
            if (sub.score >= 15) sub.riskLevel = "High";
            else if (sub.score >= 8) sub.riskLevel = "Medium";
            else sub.riskLevel = "Low";
            
            // Generate human-readable reason
            let reasonParts = [];
            if (sub.weaknessVal > 0) reasonParts.push("flagged as a weak area");
            if (sub.urgencyVal > 1) reasonParts.push("high urgency");
            if (timeConstraintPenalty > 0 && sub.isWeak) reasonParts.push("time constraints dictate prioritizing weaknesses");
            
            sub.reason = reasonParts.length > 0 ? `Prioritized because: ${reasonParts.join(', ')}.` : "Standard coverage required.";
            sub.reason += ` (Risk: ${sub.riskLevel}, ${sub.riskPercent}%)`;
        });

        // Sort descending
        priorityScores.sort((a, b) => b.score - a.score);
        const topSubject = priorityScores[0];

        // --- Edge Case Intelligence & Interventions ---

        // Optimization Intervention: Compress list if time is short
        if (isOptimizedMode && analysis.isInsufficientTime && priorityScores.length > 2) {
            // Drop the lowest priority subject to secure the others
            const dropped = priorityScores.pop();
            analysis.decisionsLog.push(`[Optimization] Dropped '${dropped.name}' from core rotation to secure passing marks in higher priority subjects.`);
            analysis.insights.push(`Optimization applied: Removed low-risk subjects to maximize hours on weak points.`);
        }

        // Extreme Urgency (<=3 days) -> Revision Mode Override
        if (analysis.isExtremeUrgency) {
            const planDays = Math.max(1, totalDays);
            analysis.decisionsLog.push(`Exam is extremely close. Aborting new material learning. Switching entirely to Revision Mode.`);
            return {
                plan: Array.from({length: planDays}).map((_, i) => ({
                    date: new Date(today.getTime() + ((i + 1 + simulationDaysSkipped) * 86400000)),
                    isRevision: true,
                    isCramming: true,
                    subject: 'Intensive Revision',
                    riskLevel: 'High',
                    riskPercent: 95,
                    topics: priorityScores.map(p => p.name).join(', '),
                    hours: data.dailyHours,
                    preferredTime: data.preferredTime
                })),
                analysisData: analysis
            };
        }

        // Generate dynamic insights
        if (topSubject && topSubject.score > 10) {
            analysis.insights.push(`<strong>${topSubject.name}</strong> is your highest priority due to its calculated score of ${topSubject.score}.`);
        }
        if (data.preferredTime.includes('Morning')) {
            analysis.insights.push(`Your choice of Morning study aligns well with peak cognitive function for difficult topics.`);
        } else if (data.preferredTime.includes('Night')) {
            analysis.insights.push(`Ensure you maintain a consistent sleep schedule to retain the Night study sessions effectively.`);
        }
        if (analysis.isUrgent && !analysis.isExtremeUrgency) {
            analysis.insights.push(`You are in a critical phase. Adhere strictly to the allocated hours to cover the syllabus.`);
        }

        // 3. Distribute Sessions
        let revisionDaysCount = totalDays > 14 ? 3 : (totalDays > 7 ? 2 : (totalDays > 3 ? 1 : 0));
        const studyDaysCount = totalDays - revisionDaysCount;
        
        analysis.decisionsLog.push(`Reserved ${revisionDaysCount} day(s) for final revision.`);

        const plan = [];
        let pool = [];
        priorityScores.forEach(sub => {
            const weight = Math.max(1, Math.ceil(sub.score / 5)); 
            for(let i=0; i<weight; i++) pool.push(sub);
        });

        for (let i = 0; i < studyDaysCount; i++) {
            const planDate = new Date(today.getTime() + ((i + 1 + simulationDaysSkipped) * 86400000));
            const sub = pool[i % pool.length];
            plan.push({
                date: planDate,
                isRevision: false,
                isCramming: false,
                subject: sub.name,
                isWeak: sub.isWeak,
                riskLevel: sub.riskLevel,
                riskPercent: sub.riskPercent,
                topics: sub.isWeak ? 'Targeted weakness practice' : 'Standard review',
                hours: data.dailyHours,
                preferredTime: data.preferredTime
            });
        }

        for (let i = 0; i < revisionDaysCount; i++) {
            const planDate = new Date(today.getTime() + ((studyDaysCount + i + 1 + simulationDaysSkipped) * 86400000));
            plan.push({
                date: planDate,
                isRevision: true,
                isCramming: false,
                subject: 'Full Syllabus Revision',
                riskLevel: 'Medium',
                riskPercent: 50,
                topics: 'Mock tests and recall exercises',
                hours: data.dailyHours,
                preferredTime: data.preferredTime
            });
        }

        // Add detailed decision logs for UI
        priorityScores.forEach(sub => {
            analysis.decisionsLog.push(`<div class="subject-reason"><strong>${sub.name}</strong> (Score: ${sub.score}): ${sub.reason}</div>`);
        });

        return { plan, analysisData: analysis };
    }

    function renderDashboard(plan, analysis) {
        generatedPlanData = plan;

        // Cards
        document.getElementById('summaryDaysLeft').textContent = analysis.totalDays;
        document.getElementById('summaryTotalHours').textContent = (analysis.totalDays * analysis.dailyHours);
        document.getElementById('summaryFocusAreas').textContent = analysis.weakTopics.length > 0 ? analysis.weakTopics.length : 'Balanced';

        // Warnings
        timeWarningBanner.style.display = analysis.isInsufficientTime ? 'flex' : 'none';
        if (simulationBanner) {
            simulationBanner.style.display = simulationDaysSkipped > 0 ? 'flex' : 'none';
        }

        // Dynamic AI Strategy Text
        let aiText = "";
        if (analysis.isExtremeUrgency) {
            aiText = `You’re entering a critical phase with extremely limited time (${analysis.totalDays} days). I am bypassing standard learning and prioritizing immediate, high-impact revision across all topics. Stay focused.`;
        } else if (analysis.isUrgent) {
            aiText = `Time is getting tight. I've engineered this schedule to aggressively target your weak areas while ensuring we cover the baseline material before your exam.`;
        } else {
            aiText = `You have a healthy runway of ${analysis.totalDays} days. I've designed a balanced, sustainable pacing strategy that interleaves your weak points with standard subjects to maximize long-term retention.`;
        }
        
        if (isOptimized) {
            aiText = "<strong>✨ Optimized Plan:</strong> " + aiText + " I have adjusted your daily hours and streamlined the focus areas to secure the highest possible yield.";
        }
        
        dynamicRecommendation.innerHTML = `"${aiText}"`;

        // Smart Insights
        insightsList.innerHTML = analysis.insights.length > 0 
            ? analysis.insights.map(i => `<li>${i}</li>`).join('')
            : `<li>Your schedule looks well-balanced and achievable.</li>`;

        // Decision Log
        decisionLog.innerHTML = analysis.decisionsLog.map(log => {
            if (log.includes('<div')) return log; // Already HTML formatted
            return `<div style="margin-bottom:0.5rem; color:var(--text-secondary)">✓ ${log}</div>`;
        }).join('');

        // Timeline
        scheduleTimeline.innerHTML = '';
        plan.forEach((dayPlan, index) => {
            const dateStr = dayPlan.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            let itemClass = 'timeline-item';
            let badges = `<span class="badge badge-time">${dayPlan.hours}h</span>`;
            
            if (dayPlan.isRevision) { itemClass += ' revision'; badges += `<span class="badge badge-revision">Revision</span>`; }
            else if (dayPlan.isCramming) { itemClass += ' urgent'; badges += `<span class="badge badge-weak">Urgent</span>`; }
            else if (dayPlan.isWeak) { badges += `<span class="badge badge-weak">Targeted</span>`; }

            if (dayPlan.riskLevel) {
                badges += `<span class="badge badge-risk-${dayPlan.riskLevel.toLowerCase()}">${dayPlan.riskLevel} Risk (${dayPlan.riskPercent}%)</span>`;
            }

            scheduleTimeline.insertAdjacentHTML('beforeend', `
                <div class="${itemClass}">
                    <div class="timeline-date">${dateStr}</div>
                    <div class="timeline-content" tabindex="0">
                        <div class="task-main">
                            <span class="task-subject">${dayPlan.subject}</span>
                            <span class="task-topics">${dayPlan.topics}</span>
                        </div>
                        <div class="task-meta">${badges}</div>
                    </div>
                </div>
            `);
        });
    }

    function exportPlan() {
        if (!generatedPlanData.length) return;
        let txt = "🤖 My StudyGenius AI Plan\n\n";
        generatedPlanData.forEach(d => {
            txt += `[${d.date.toLocaleDateString()}] ${d.subject}\n   Focus: ${d.topics} | ${d.hours}h\n`;
        });
        navigator.clipboard.writeText(txt).then(() => showToast("Plan copied to clipboard!"));
    }

    function exportCalendar() {
        if (!generatedPlanData.length) return;
        
        let icsData = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyGenius AI//EN\n";
        
        generatedPlanData.forEach((d, i) => {
            const dateStr = d.date.toISOString().replace(/[-:]/g, '').split('T')[0];
            const nextDate = new Date(d.date);
            nextDate.setDate(nextDate.getDate() + 1);
            const nextDateStr = nextDate.toISOString().replace(/[-:]/g, '').split('T')[0];
            
            icsData += "BEGIN:VEVENT\n";
            icsData += `UID:studygenius-${Date.now()}-${i}@studygenius.ai\n`;
            icsData += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
            icsData += `DTSTART;VALUE=DATE:${dateStr}\n`;
            icsData += `DTEND;VALUE=DATE:${nextDateStr}\n`;
            icsData += `SUMMARY:Study: ${d.subject}\n`;
            icsData += `DESCRIPTION:Topics: ${d.topics}\\nHours: ${d.hours}\\nPreferred Time: ${d.preferredTime}\\nRisk Level: ${d.riskLevel || 'N/A'}\\n\\nGenerated by StudyGenius AI\n`;
            icsData += "END:VEVENT\n";
        });
        
        icsData += "END:VCALENDAR";

        const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'study_plan.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("Calendar file downloaded!");
    }

    function showToast(msg, isError = false) {
        toast.textContent = msg;
        toast.style.background = isError ? 'var(--accent-red)' : 'var(--primary-color)';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});
