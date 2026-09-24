// ================================
// 60个人的自定义名字
// ================================

const personNames = {
    1: "张子墨",
    2: "童禹坤",
    3: "邓佳鑫",
    4: "陈浚铭",
    5: "李煜东",
    6: "陈思罕",
    7: "魏子宸",
    8: "聂玮辰",
    9: "张奕然",
    10: "王源",

    11: "易烊千玺",
    12: "王俊凯",
    13: "贺峻霖",
    14: "严浩翔",
    15: "张真源",
    16: "宋亚轩",
    17: "刘耀文",
    18: "丁程鑫",
    19: "马嘉祺",
    20: "余宇涵",

    21: "张峻豪",
    22: "陈燊",
    23: "越艺晨",
    24: "刘瀚辰",
    25: "赵俊羽",
    26: "佟弋",
    27: "魏新航",
    28: "胡阿米",
    29: "陈璟翊",
    30: "张誉严",


    31: "杨涵博",
32: "陈奕恒",
33: "杨博文",
34: "左奇函",
35: "王烁然",
36: "张函瑞",
37: "王橹杰",
38: "张桂源",
39: "官俊臣",
40: "黄朔",

41: "穆祉丞",
42: "朱志鑫",
43: "张泽禹",
44: "左航",
45: "苏新皓",
46: "张极",
47: "吕政熙",
48: "刘禹辰",
49: "侯王子",
50: "杨云皓",

51: "余政霖",
52: "高铭阳",
53: "杨子豪",
54: "任玄哲",
55: "宋金泽",
56: "皮子渝",
57: "智恩涵",
58: "沈子航",
59: "杨林好",
60: "朱映宸"
};
const people = [];
for (let i = 1; i <= 60; i++) {
    people.push({
        id: i,
         name: personNames[i],
        image: "images/person" + i + ".webp"
    });
}

const selectionPage = document.getElementById("selectionPage");
const selectionInfo = document.getElementById("selectionInfo");
const selectionGroups = document.getElementById("selectionGroups");
const battlePage = document.getElementById("battlePage");
const stageTitle = document.getElementById("stageTitle");
const battleCount = document.getElementById("battleCount");
const battleInstruction = document.getElementById("battleInstruction");
const battleArea = document.getElementById("battleArea");
const resultPage = document.getElementById("resultPage");
const ranking = document.getElementById("ranking");
const restartButton = document.getElementById("restartButton");

let startPage = document.getElementById("startPage");
let startButton = document.getElementById("startButton");

if (!startPage) {
    startPage = document.createElement("section");
    startPage.id = "startPage";
    startPage.innerHTML = `
        <h1>喜欢的脸 TOP 9</h1>
        <p class="subtitle">从60张照片中选出你最喜欢的脸</p>
        <button id="startButton" class="start-button">开始 PK</button>
    `;
    document.querySelector(".container").insertBefore(startPage, selectionPage);
    startButton = document.getElementById("startButton");
}

const oldNextButton = document.getElementById("nextButton");
if (oldNextButton) oldNextButton.remove();

const oldBattleButtons = document.querySelectorAll("#battleButtons, .battle-buttons, #battleControls");
oldBattleButtons.forEach(el => el.remove());

const extraStyle = document.createElement("style");
extraStyle.textContent = `
    #nextButton { display:none !important; }
    .selection-buttons,.battle-buttons{
        display:flex;
        justify-content:center;
        gap:15px;
        margin-top:30px
    }
    .selection-buttons button,.battle-buttons button{
        padding:13px 30px;
        border:none;
        border-radius:30px;
        font-size:17px;
        cursor:pointer
    }
    .back-button{
        background:#ddd;
        color:#555
    }
    .back-button:hover:not(:disabled){
        background:#ccc
    }
    .back-button:disabled{
        opacity:.45;
        cursor:not-allowed
    }
    .next-group-button{
        background:#ff7fa2;
        color:#fff
    }
    .next-group-button:hover:not(:disabled){
        background:#ff5f89
    }
    .next-group-button:disabled{
        opacity:.45;
        cursor:not-allowed
    }
    .start-button{
        margin-top:25px;
        padding:15px 45px;
        border:none;
        border-radius:30px;
        background:#ff7fa2;
        color:#fff;
        font-size:18px;
        font-weight:bold;
        cursor:pointer
    }
`;
document.head.appendChild(extraStyle);

const scores = {};
people.forEach(p => scores[p.id] = 0);

let selectedPeople = [];
let selectionRounds = [];
let selectionRoundIndex = 0;
let selectionChoices = [];

let currentStage = "";
let currentGroups = [];
let currentGroupIndex = 0;
let currentGroup = [];
let clickOrder = [];
let groupStates = [];

let stage2Remaining = [];
let finalPeople = [];
let finalMatches = [];
let finalMatchIndex = 0;
let finalMatchAnswered = false;
let finalMatchHistory = [];

let tieContext = null;
let transitionTimer = null;

function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function cloneScores() {
    return { ...scores };
}

function restoreScores(snapshot) {
    people.forEach(p => scores[p.id] = snapshot[p.id] || 0);
}

function clearTimer() {
    if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = null;
    }
}

function createGroups(array) {
    if (array.length === 0) return [];
    if (array.length === 1) return [array];

    const shuffled = shuffle(array);
    const groupCount = Math.ceil(shuffled.length / 4);
    const groups = [];
    let start = 0;

    for (let i = 0; i < groupCount; i++) {
        const remaining = shuffled.length - start;
        const groupsLeft = groupCount - i;

        let size = Math.ceil(remaining / groupsLeft);
        size = Math.min(4, size);

        if (remaining - size < 2 * (groupsLeft - 1)) {
            size = remaining - 2 * (groupsLeft - 1);
        }

        groups.push(shuffled.slice(start, start + size));
        start += size;
    }

    return groups;
}

function setPages(page) {
    startPage.style.display = page === "start" ? "block" : "none";
    selectionPage.style.display = page === "selection" ? "block" : "none";
    battlePage.style.display = page === "battle" ? "block" : "none";
    resultPage.style.display = page === "result" ? "block" : "none";
}

function removeBattleControls() {
    battlePage
        .querySelectorAll(".battle-buttons,#battleButtons,#battleControls")
        .forEach(el => el.remove());
}

function createBattleControls() {
    removeBattleControls();

    const box = document.createElement("div");
    box.className = "battle-buttons";

    const back = document.createElement("button");
    back.className = "back-button";
    back.textContent = currentStage === "final"
        ? "返回上一场"
        : "返回上一组";

    back.disabled = currentStage === "final"
        ? finalMatchIndex === 0
        : currentGroupIndex === 0;

    back.addEventListener("click", battleBack);

    const next = document.createElement("button");
    next.className = "next-group-button";

    next.disabled = currentStage === "final"
        ? !finalMatchAnswered
        : clickOrder.length < 2;

    if (currentStage === "final") {
        next.textContent =
            finalMatchIndex === finalMatches.length - 1
                ? "查看排名"
                : "下一场";
    } else if (tieContext) {
        next.textContent =
            tieContext.groupIndex === tieContext.groups.length - 1
                ? "完成加赛"
                : "下一组";
    } else {
        next.textContent =
            currentGroupIndex === currentGroups.length - 1
                ? "进入下一轮"
                : "下一组";
    }

    next.addEventListener("click", battleNext);

    box.append(back, next);
    battlePage.appendChild(box);
}

function battleNext() {
    clearTimer();

    if (currentStage === "final") {
        if (!finalMatchAnswered) return;

        finalMatchHistory.length = finalMatchIndex + 1;
        finalMatchIndex++;

        showFinalMatch();
        return;
    }

    if (clickOrder.length < 2) return;

    if (tieContext) {
        tieContext.states.length = tieContext.groupIndex + 1;
        tieContext.groupIndex++;

        runTieGroup();
        return;
    }

    groupStates.length = currentGroupIndex + 1;
    currentGroupIndex++;

    if (currentStage === "stage2-round1") {
        showStage2Group();
    } else if (currentStage === "stage2-round2") {
        showStage2Round2Group();
    } else {
        showRankingGroup();
    }
}

function saveCurrentGroupState() {
    if (!currentGroups[currentGroupIndex]) return;

    groupStates[currentGroupIndex] = {
        beforeScores:
            groupStates[currentGroupIndex]?.beforeScores || cloneScores(),
        order: [...clickOrder]
    };
}
function loadGroupState(index) {
    const state = groupStates[index];

    if (!state) {
        groupStates[index] = {
            beforeScores: cloneScores(),
            order: []
        };

        clickOrder = [];
        return;
    }

    restoreScores(state.beforeScores);

    clickOrder = [...state.order];

    clickOrder.forEach((id, index) => {
        scores[id] += index === 0 ? 2 : 1;
    });
}

function applyCurrentGroupClick(person, card) {
    if (clickOrder.length >= 2) return;
    if (clickOrder.includes(person.id)) return;

    clickOrder.push(person.id);

    scores[person.id] += clickOrder.length === 1 ? 2 : 1;

    card.dataset.clicked = "true";

    card.style.outline =
        clickOrder.length === 1
            ? "5px solid #ff7fa2"
            : "5px solid #ffb6c8";

    saveCurrentGroupState();
    createBattleControls();
}

function renderExistingClicks(container) {
    const cards = [...container.querySelectorAll(".battle-person")];

    clickOrder.forEach((id, index) => {
        const card = cards.find(
            c => Number(c.dataset.personId) === id
        );

        if (!card) return;

        card.dataset.clicked = "true";

        card.style.outline =
            index === 0
                ? "5px solid #ff7fa2"
                : "5px solid #ffb6c8";
    });
}

function createBattleCard(person, container, clickFunction) {
    const card = document.createElement("div");

    card.className = "battle-person";
    card.dataset.personId = person.id;

    const image = document.createElement("img");
    image.src = person.image;
    image.alt = person.name;

    const name = document.createElement("p");
    name.textContent = person.name;

    card.append(image, name);
    container.appendChild(card);

    card.addEventListener("click", () => {
        clickFunction(card);
    });

    return card;
}

setPages("start");

startButton.addEventListener("click", startSelectionStage);

function startSelectionStage() {
    clearTimer();

    selectedPeople = [];
    selectionRoundIndex = 0;

    selectionChoices =
        Array.from({ length: 15 }, () => new Set());

    const shuffled = shuffle(people);

    selectionRounds = [];

    for (let i = 0; i < 15; i++) {
        selectionRounds.push(
            shuffled.slice(i * 4, i * 4 + 4)
        );
    }

    setPages("selection");
    showSelectionGroup();
}

function updateSelectedPeople() {
    const ids = new Set();

    selectionChoices.forEach(set => {
        set.forEach(id => ids.add(id));
    });

    selectedPeople = people.filter(
        p => ids.has(p.id)
    );

    selectionInfo.textContent =
        `第 ${selectionRoundIndex + 1} / 15 组　·　已选择 ${selectedPeople.length} 张`;
}

function showSelectionGroup() {
    selectionGroups.innerHTML = "";

    updateSelectedPeople();

    const group =
        selectionRounds[selectionRoundIndex];

    const groupBox =
        document.createElement("div");

    groupBox.className = "selection-group";

    const title =
        document.createElement("div");

    title.className = "group-title";
    title.textContent = "请选择你喜欢的脸";

    const grid =
        document.createElement("div");

    grid.className = "group-grid";

    group.forEach(person => {
        const card =
            document.createElement("div");

        card.className = "person";

        if (
            selectionChoices[selectionRoundIndex]
                .has(person.id)
        ) {
            card.classList.add("selected");
        }

        const image =
            document.createElement("img");

        image.src = person.image;
        image.alt = person.name;

        const name =
            document.createElement("p");

        name.textContent = person.name;

        card.append(image, name);
        grid.appendChild(card);

        card.addEventListener("click", () => {
            const set =
                selectionChoices[selectionRoundIndex];

            if (set.has(person.id)) {
                set.delete(person.id);
                card.classList.remove("selected");
            } else {
                set.add(person.id);
                card.classList.add("selected");
            }

            updateSelectedPeople();
        });
    });

    const buttons =
        document.createElement("div");

    buttons.className = "selection-buttons";

    const back =
        document.createElement("button");

    back.className = "back-button";
    back.textContent = "返回上一组";
    back.disabled =
        selectionRoundIndex === 0;

    back.addEventListener("click", () => {
        if (selectionRoundIndex > 0) {
            selectionRoundIndex--;
            showSelectionGroup();
        }
    });

    const next =
        document.createElement("button");

    next.className = "next-group-button";

    next.textContent =
        selectionRoundIndex === 14
            ? "完成选择"
            : "下一组";

    next.addEventListener("click", () => {
        if (selectionRoundIndex < 14) {
            selectionRoundIndex++;
            showSelectionGroup();
        } else {
            finishSelectionStage();
        }
    });

    buttons.append(back, next);

    groupBox.append(
        title,
        grid,
        buttons
    );

    selectionGroups.appendChild(groupBox);
}

function finishSelectionStage() {
    updateSelectedPeople();

    if (selectedPeople.length < 19) {
        alert(
            `你只选择了 ${selectedPeople.length} 张照片。\n\n` +
            `至少需要选择19张才能进入下一阶段。\n\n` +
            `将回到第一组重新选择。`
        );

        startSelectionStage();
        return;
    }

    alert(
        `选择完成！\n\n` +
        `你一共选择了 ${selectedPeople.length} 张照片。\n\n` +
        `现在进入第一轮淘汰。`
    );

    startStage2Round1();
}

function startStage2Round1() {
    currentStage = "stage2-round1";

    currentGroupIndex = 0;
    currentGroups = createGroups(selectedPeople);

    groupStates = [];

    stageTitle.textContent =
        "STAGE2 · ROUND1";

    battleInstruction.textContent =
        "请按照喜爱程度依次点击两张照片";

    setPages("battle");

    showStage2Group();
}

function showStage2Group() {
    clearTimer();

    battleArea.innerHTML = "";

    if (
        currentGroupIndex >=
        currentGroups.length
    ) {
        startStage2Round2();
        return;
    }

    currentGroup =
        currentGroups[currentGroupIndex];

    loadGroupState(currentGroupIndex);

    battleCount.textContent =
        `第 ${currentGroupIndex + 1} / ${currentGroups.length} 组`;

    renderBattleGroup();
}

function renderBattleGroup() {
    battleArea.innerHTML = "";

    currentGroup.forEach(person => {
        createBattleCard(
            person,
            battleArea,
            card => applyCurrentGroupClick(
                person,
                card
            )
        );
    });

    renderExistingClicks(battleArea);
    createBattleControls();
}

function startStage2Round2() {
    currentStage = "stage2-round2";

    stage2Remaining =
        selectedPeople.filter(
            p => scores[p.id] === 0
        );

    if (stage2Remaining.length <= 1) {
        finishStage2();
        return;
    }

    currentGroupIndex = 0;
    currentGroups =
        createGroups(stage2Remaining);

    groupStates = [];

    stageTitle.textContent =
        "SATGE2 · ROUND2";

    battleInstruction.textContent =
        "请按照喜爱程度依次点击两张照片";

    showStage2Round2Group();
}

function showStage2Round2Group() {
    clearTimer();

    battleArea.innerHTML = "";

    if (
        currentGroupIndex >=
        currentGroups.length
    ) {
        finishStage2();
        return;
    }

    currentGroup =
        currentGroups[currentGroupIndex];

    loadGroupState(currentGroupIndex);

    battleCount.textContent =
        `第 ${currentGroupIndex + 1} / ${currentGroups.length} 组`;

    renderBattleGroup();
}

function finishStage2() {
    const survivors =
        selectedPeople.filter(
            p => scores[p.id] > 0
        );

    startStage3(survivors);
}
function startStage3(candidates) {
    currentStage = "stage3";
    tieContext = null;

    if (candidates.length <= 18) {
        startStage4(candidates);
        return;
    }

    currentGroupIndex = 0;

    currentGroups =
        createGroups(candidates);

    groupStates = [];

    stageTitle.textContent =
        "STAGE3 · TOP 18";

    battleInstruction.textContent =
        "请按照喜爱程度依次点击两张照片";

    showRankingGroup();
}

function startStage4(candidates) {
    currentStage = "stage4";
    tieContext = null;

    if (candidates.length <= 9) {
        finishTop9([...candidates]);
        return;
    }

    currentGroupIndex = 0;

    currentGroups =
        createGroups(candidates);

    groupStates = [];

    stageTitle.textContent =
        "STAGE4 · TOP 9";

    battleInstruction.textContent =
        "请按照喜爱程度依次点击两张照片";

    showRankingGroup();
}

function showRankingGroup() {
    clearTimer();

    battleArea.innerHTML = "";

    if (
        currentGroupIndex >=
        currentGroups.length
    ) {
        finishRankingStage();
        return;
    }

    currentGroup =
        currentGroups[currentGroupIndex];

    loadGroupState(currentGroupIndex);

    battleCount.textContent =
        `第 ${currentGroupIndex + 1} / ${currentGroups.length} 组`;

    renderBattleGroup();
}

function finishRankingStage() {
    const allPeople =
        currentGroups.flat();

    const target =
        currentStage === "stage3"
            ? 18
            : 9;

    const sorted =
        [...allPeople].sort(
            (a, b) =>
                scores[b.id] - scores[a.id] ||
                a.id - b.id
        );

    if (sorted.length <= target) {
        if (currentStage === "stage3") {
            startStage4(sorted);
        } else {
            finishTop9(sorted);
        }

        return;
    }

    const cutoffScore =
        scores[sorted[target - 1].id];

    const tied =
        sorted.filter(
            p => scores[p.id] === cutoffScore
        );

    if (tied.length === 1) {
        const winners =
            sorted.slice(0, target);

        if (currentStage === "stage3") {
            startStage4(winners);
        } else {
            finishTop9(winners);
        }

        return;
    }

    startTieBreaker(
        sorted,
        target,
        tied
    );
}

function finishTop9(winners) {
    finalPeople =
        [...winners].slice(0, 9);

    startFinalStage();
}

function startTieBreaker(
    sorted,
    target,
    tied
) {
    const safePeople =
        sorted.filter(
            p =>
                scores[p.id] >
                scores[tied[0].id]
        );

    const need =
        target - safePeople.length;

    const tieScores = {};

    tied.forEach(
        p => tieScores[p.id] = 0
    );

    tieContext = {
        groups: createGroups(tied),
        groupIndex: 0,
        tieScores,
        sorted,
        target,
        need,
        states: []
    };

    runTieGroup();
}

function runTieGroup() {
    clearTimer();

    const ctx = tieContext;

    if (!ctx) return;

    if (
        ctx.groupIndex >=
        ctx.groups.length
    ) {
        finishTieBreaker();
        return;
    }

    const index =
        ctx.groupIndex;

    const state =
        ctx.states[index];

    if (state) {
        ctx.tieScores =
            { ...state.beforeScores };

        state.order.forEach(
            (id, orderIndex) => {
                ctx.tieScores[id] +=
                    orderIndex === 0
                        ? 2
                        : 1;
            }
        );
    } else {
        ctx.states[index] = {
            beforeScores:
                { ...ctx.tieScores },
            order: []
        };
    }

    battleArea.innerHTML = "";

    clickOrder =
        [...ctx.states[index].order];

    const group =
        ctx.groups[index];

    stageTitle.textContent =
        "同分加赛";

    battleCount.textContent =
        `加赛第 ${index + 1} / ${ctx.groups.length} 组`;

    battleInstruction.textContent =
        "请再次按照喜欢程度依次点击照片";

    group.forEach(person => {
        createBattleCard(
            person,
            battleArea,
            card => {
                if (
                    clickOrder.length >= 2
                ) {
                    return;
                }

                if (
                    clickOrder.includes(
                        person.id
                    )
                ) {
                    return;
                }

                clickOrder.push(
                    person.id
                );

                ctx.tieScores[person.id] +=
                    clickOrder.length === 1
                        ? 2
                        : 1;

                ctx.states[index].order =
                    [...clickOrder];

                card.dataset.clicked =
                    "true";

                card.style.outline =
                    clickOrder.length === 1
                        ? "5px solid #ff7fa2"
                        : "5px solid #ffb6c8";

                createBattleControls();
            }
        );
    });

    clickOrder.forEach(
        (id, orderIndex) => {
            const card =
                [
                    ...battleArea.querySelectorAll(
                        ".battle-person"
                    )
                ].find(
                    el =>
                        Number(
                            el.dataset.personId
                        ) === id
                );

            if (!card) return;

            card.dataset.clicked =
                "true";

            card.style.outline =
                orderIndex === 0
                    ? "5px solid #ff7fa2"
                    : "5px solid #ffb6c8";
        }
    );

    createBattleControls();
}

function finishTieBreaker() {
    const ctx = tieContext;

    const sortedTie =
        [...ctx.groups.flat()].sort(
            (a, b) =>
                ctx.tieScores[b.id] -
                    ctx.tieScores[a.id] ||
                a.id - b.id
        );

    const selected =
        sortedTie.slice(
            0,
            ctx.need
        );

    const selectedIds =
        new Set(
            selected.map(
                p => p.id
            )
        );

    const cutoff =
        scores[
            ctx.sorted[
                ctx.target - 1
            ].id
        ];

    const winners =
        ctx.sorted.filter(
            p =>
                scores[p.id] > cutoff ||
                selectedIds.has(p.id)
        ).slice(
            0,
            ctx.target
        );

    tieContext = null;

    if (currentStage === "stage3") {
        startStage4(winners);
    } else {
        finishTop9(winners);
    }
}

function battleBack() {
    clearTimer();

    if (currentStage === "final") {
        if (finalMatchIndex === 0) {
            return;
        }

        finalMatchIndex--;

        showFinalMatch();
        return;
    }

    if (tieContext) {
        if (tieContext.groupIndex === 0) {
            return;
        }

        tieContext.groupIndex--;

        runTieGroup();
        return;
    }

    if (currentGroupIndex === 0) {
        return;
    }

    currentGroupIndex--;

    if (currentStage === "stage2-round1") {
        showStage2Group();
    } else if (currentStage === "stage2-round2") {
        showStage2Round2Group();
    } else {
        showRankingGroup();
    }
}
function startFinalStage() {
    finalMatches = [];
    finalMatchIndex = 0;
    finalMatchHistory = [];
    finalMatchAnswered = false;

    for (
        let i = 0;
        i < finalPeople.length;
        i++
    ) {
        for (
            let j = i + 1;
            j < finalPeople.length;
            j++
        ) {
            finalMatches.push({
                person1: finalPeople[i],
                person2: finalPeople[j]
            });
        }
    }

    currentStage = "final";

    showFinalMatch();
}

function showFinalMatch() {
    clearTimer();

    battleArea.innerHTML = "";

    if (
        finalMatchIndex >=
        finalMatches.length
    ) {
        showResult();
        return;
    }

    let state =
        finalMatchHistory[
            finalMatchIndex
        ];

    if (!state) {
        state = {
            beforeScores:
                cloneScores(),
            winnerId: null,
            answered: false
        };

        finalMatchHistory[
            finalMatchIndex
        ] = state;
    } else {
        restoreScores(
            state.beforeScores
        );

        if (
            state.winnerId !== null
        ) {
            scores[
                state.winnerId
            ] += 2;
        }
    }

    finalMatchAnswered =
        state.winnerId !== null;

    const match =
        finalMatches[
            finalMatchIndex
        ];

    stageTitle.textContent =
        "最终 TOP 9";

    battleCount.textContent =
        `第 ${finalMatchIndex + 1} / ${finalMatches.length} 场`;

    battleInstruction.textContent =
        "请选择你更喜欢的脸";

    const leftCard =
        createBattleCardElement(
            match.person1
        );

    const rightCard =
        createBattleCardElement(
            match.person2
        );

    const vs =
        document.createElement("div");

    vs.className = "vs";
    vs.textContent = "VS";

    battleArea.append(
        leftCard,
        vs,
        rightCard
    );

    if (
        state.winnerId ===
        match.person1.id
    ) {
        leftCard.style.outline =
            "5px solid #ff7fa2";
    }

    if (
        state.winnerId ===
        match.person2.id
    ) {
        rightCard.style.outline =
            "5px solid #ff7fa2";
    }

    leftCard.addEventListener(
        "click",
        () =>
            finishFinalMatch(
                match.person1
            )
    );

    rightCard.addEventListener(
        "click",
        () =>
            finishFinalMatch(
                match.person2
            )
    );

    createBattleControls();
}

function createBattleCardElement(person) {
    const card =
        document.createElement("div");

    card.className =
        "battle-person";

    card.dataset.personId =
        person.id;

    const image =
        document.createElement("img");

    image.src = person.image;
    image.alt = person.name;

    const name =
        document.createElement("p");

    name.textContent =
        person.name;

    card.append(
        image,
        name
    );

    return card;
}

function finishFinalMatch(winner) {
    if (finalMatchAnswered) {
        return;
    }

    const state =
        finalMatchHistory[
            finalMatchIndex
        ];

    restoreScores(
        state.beforeScores
    );

    scores[winner.id] += 2;

    state.winnerId =
        winner.id;

    state.answered = true;

    finalMatchAnswered = true;

    createBattleControls();

    const cards =
        battleArea.querySelectorAll(
            ".battle-person"
        );

    cards.forEach(card => {
        if (
            Number(
                card.dataset.personId
            ) === winner.id
        ) {
            card.style.outline =
                "5px solid #ff7fa2";
        }
    });
}

function showResult() {
    clearTimer();

    setPages("result");

    const sorted =
        [...finalPeople].sort(
            (a, b) =>
                scores[b.id] -
                    scores[a.id] ||
                a.id - b.id
        );

    // 九宫格位置：
    // 第2名 第1名 第3名
    // 第4名 第5名 第6名
    // 第7名 第8名 第9名
    const rankingOrder = [
        2, 1, 3,
        4, 5, 6,
        7, 8, 9
    ];

    ranking.innerHTML = "";

    rankingOrder.forEach(rankNumber => {

        // 根据最终排名找到对应人物
        const person = sorted[rankNumber - 1];

        const item =
            document.createElement("div");

        item.className =
            "rank-item rank-" + rankNumber;

        // 排名数字
        const rank =
            document.createElement("div");

        rank.className =
            "rank-number";

        rank.textContent =
            rankNumber;

        // 照片
        const image =
            document.createElement("img");

        image.src =
            person.image;

        image.alt =
            person.name;

        // 名字
        const name =
            document.createElement("div");

        name.className =
            "rank-name";

        name.textContent =
            person.name;

        item.append(
            rank,
            image,
            name
        );

        ranking.appendChild(item);
    });
}

restartButton.addEventListener(
    "click",
    () => {
        clearTimer();

        people.forEach(
            p => scores[p.id] = 0
        );

        selectedPeople = [];
        selectionRounds = [];
        selectionRoundIndex = 0;
        selectionChoices = [];

        currentStage = "";
        currentGroups = [];
        currentGroupIndex = 0;
        currentGroup = [];
        clickOrder = [];
        groupStates = [];

        stage2Remaining = [];

        finalPeople = [];
        finalMatches = [];
        finalMatchIndex = 0;
        finalMatchAnswered = false;
        finalMatchHistory = [];

        tieContext = null;

        battleArea.innerHTML = "";
        selectionGroups.innerHTML = "";
        ranking.innerHTML = "";

        removeBattleControls();

        setPages("start");
    }
);
