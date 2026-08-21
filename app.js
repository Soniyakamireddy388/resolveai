// ======================================================
// RESOLVEAI - EXCEPTION RESOLUTION WORKBENCH
// ======================================================

// ======================================================
// 1. MOCK EXCEPTION DATA
// ======================================================

const exceptions = [
    {
        id: "EXC-1001",
        transactionId: "INV-1024",
        vendor: "ABC Supplies",
        category: "Invoice Mismatch",
        amount: 84500,
        expectedAmount: 78000,
        confidence: 96,
        reason: "Invoice amount exceeds the approved purchase order amount.",
        status: "pending",
        auditLog: [
            {
                action: "Exception detected",
                time: new Date().toLocaleTimeString()
            }
        ]
    },

    {
        id: "EXC-1002",
        transactionId: "INV-1025",
        vendor: "Global Tech Ltd",
        category: "Duplicate Payment",
        amount: 32000,
        expectedAmount: 32000,
        confidence: 87,
        reason: "A similar payment was detected within the previous 7 days.",
        status: "pending",
        auditLog: [
            {
                action: "Exception detected",
                time: new Date().toLocaleTimeString()
            }
        ]
    },

    {
        id: "EXC-1003",
        transactionId: "INV-1026",
        vendor: "Metro Services",
        category: "Tax Mismatch",
        amount: 12400,
        expectedAmount: 12000,
        confidence: 62,
        reason: "The tax amount differs from the expected tax calculation.",
        status: "pending",
        auditLog: [
            {
                action: "Exception detected",
                time: new Date().toLocaleTimeString()
            }
        ]
    },

    {
        id: "EXC-1004",
        transactionId: "INV-1027",
        vendor: "Office World",
        category: "Quantity Mismatch",
        amount: 45600,
        expectedAmount: 45600,
        confidence: 94,
        reason: "Invoice quantity is higher than the approved quantity.",
        status: "pending",
        auditLog: [
            {
                action: "Exception detected",
                time: new Date().toLocaleTimeString()
            }
        ]
    }
];


// ======================================================
// 2. CONFIGURATION
// ======================================================

const AUTO_RESOLVE_THRESHOLD = 90;


// ======================================================
// 3. HELPER FUNCTIONS
// ======================================================

function canAutoResolve(exception) {
    return exception.confidence >= AUTO_RESOLVE_THRESHOLD;
}


function addAuditLog(exception, action) {
    exception.auditLog.push({
        action: action,
        time: new Date().toLocaleTimeString()
    });
}


// ======================================================
// 4. RENDER EXCEPTION QUEUE
// ======================================================

function renderExceptions() {

    const list = document.getElementById("exceptionList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    exceptions.forEach(function (exception) {

        const card = document.createElement("div");

        card.className = "exception-card";

        card.onclick = function () {
            showException(exception.id);
        };

        card.innerHTML = `
            <div class="exception-top">

                <div>
                    <div class="exception-id">
                        ${exception.transactionId}
                    </div>

                    <div class="exception-category">
                        ${exception.category}
                    </div>
                </div>

                <div>
                    ${exception.status}
                </div>

            </div>

            <div class="exception-amount">
                ₹${exception.amount.toLocaleString("en-IN")}
            </div>

            <div class="confidence">
                Confidence: ${exception.confidence}%
            </div>
        `;

        list.appendChild(card);
    });
}


// ======================================================
// 5. UPDATE DASHBOARD
// ======================================================

function updateStats() {

    const total = exceptions.length;

    const pending = exceptions.filter(function (exception) {
        return (
            exception.status === "pending" ||
            exception.status === "review"
        );
    }).length;

    const autoResolvable = exceptions.filter(function (exception) {
        return (
            exception.status === "pending" &&
            canAutoResolve(exception)
        );
    }).length;

    const resolved = exceptions.filter(function (exception) {
        return exception.status === "resolved";
    }).length;


    const totalCount = document.getElementById("totalCount");
    const pendingCount = document.getElementById("pendingCount");
    const autoCount = document.getElementById("autoCount");
    const resolvedCount = document.getElementById("resolvedCount");


    if (totalCount) {
        totalCount.textContent = total;
    }

    if (pendingCount) {
        pendingCount.textContent = pending;
    }

    if (autoCount) {
        autoCount.textContent = autoResolvable;
    }

    if (resolvedCount) {
        resolvedCount.textContent = resolved;
    }
}


// ======================================================
// 6. AUDIT TRAIL
// ======================================================

function buildAuditHTML(exception) {

    let html = `
        <div class="audit-section">

            <h3>Audit Trail</h3>

            <div class="audit-list">
    `;

    exception.auditLog.forEach(function (log) {

        html += `
            <div class="audit-item">

                <div class="audit-dot"></div>

                <div>
                    <strong>
                        ${log.action}
                    </strong>

                    <span>
                        ${log.time}
                    </span>
                </div>

            </div>
        `;
    });

    html += `
            </div>

        </div>
    `;

    return html;
}


// ======================================================
// 7. SHOW EXCEPTION
// ======================================================

function showException(exceptionId) {

    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }

    const emptyState = document.getElementById("emptyState");
    const details = document.getElementById("exceptionDetails");

    if (!details) {
        return;
    }

    if (emptyState) {
        emptyState.classList.add("hidden");
    }

    details.classList.remove("hidden");


    const difference = Math.abs(
        exception.amount - exception.expectedAmount
    );


    let actionButtons = "";


    // --------------------------------------------------
    // RESOLVED
    // --------------------------------------------------

    if (exception.status === "resolved") {

        actionButtons = `
            <div class="analysis-box">

                <div class="analysis-title">
                    ✓ Resolved
                </div>

                <p>
                    This exception has been successfully resolved.
                </p>

            </div>
        `;

    }


    // --------------------------------------------------
    // NOT RESOLVED
    // --------------------------------------------------

    else {

        let resolutionButton = "";

        if (canAutoResolve(exception)) {

            resolutionButton = `
                <button
                    class="btn success"
                    onclick="autoResolve('${exception.id}')"
                >
                    Auto Resolve
                </button>
            `;

        } else {

            resolutionButton = `
                <button
                    class="btn warning"
                    onclick="requestHumanReview('${exception.id}')"
                >
                    Request Human Review
                </button>
            `;
        }


        actionButtons = `
            <div class="action-buttons">

                <button
                    class="btn secondary"
                    onclick="explainException('${exception.id}')"
                >
                    Explain Exception
                </button>


                <button
                    class="btn primary"
                    onclick="suggestResolution('${exception.id}')"
                >
                    Suggest Resolution
                </button>


                ${resolutionButton}


                <button
                    class="btn danger"
                    onclick="resolveManually('${exception.id}')"
                >
                    Resolve Manually
                </button>

            </div>
        `;
    }


    // --------------------------------------------------
    // DETAILS
    // --------------------------------------------------

    details.innerHTML = `

        <div class="details-header">

            <div>

                <span class="details-label">
                    EXCEPTION
                </span>

                <h2>
                    ${exception.transactionId}
                </h2>

                <p>
                    ${exception.vendor}
                </p>

            </div>


            <div class="confidence-badge">
                ${exception.confidence}% confidence
            </div>

        </div>


        <div class="details-grid">

            <div class="detail-box">

                <span>
                    Invoice Amount
                </span>

                <strong>
                    ₹${exception.amount.toLocaleString("en-IN")}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Expected Amount
                </span>

                <strong>
                    ₹${exception.expectedAmount.toLocaleString("en-IN")}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Difference
                </span>

                <strong>
                    ₹${difference.toLocaleString("en-IN")}
                </strong>

            </div>


            <div class="detail-box">

                <span>
                    Category
                </span>

                <strong>
                    ${exception.category}
                </strong>

            </div>

        </div>


        <div class="analysis-box">

            <div class="analysis-title">
                AI Analysis
            </div>

            <p>
                ${exception.reason}
            </p>

            <div class="analysis-confidence">

                AI Confidence:

                <strong>
                    ${exception.confidence}%
                </strong>

            </div>

        </div>


        <div class="resolution-box">

            <h3>
                Resolution Policy
            </h3>

            ${
                canAutoResolve(exception)

                ? `

                    <div class="policy-success">

                        ✓ Eligible for automatic resolution.

                        <br><br>

                        Confidence:
                        <strong>
                            ${exception.confidence}%
                        </strong>

                        ≥

                        Threshold:
                        <strong>
                            ${AUTO_RESOLVE_THRESHOLD}%
                        </strong>

                    </div>

                `

                : `

                    <div class="policy-warning">

                        ⚠ Human review required.

                        <br><br>

                        Confidence:
                        <strong>
                            ${exception.confidence}%
                        </strong>

                        &lt;

                        Threshold:
                        <strong>
                            ${AUTO_RESOLVE_THRESHOLD}%
                        </strong>

                    </div>

                `
            }

        </div>


        ${actionButtons}


        <div id="aiResponse"></div>


        ${buildAuditHTML(exception)}

    `;
}


// ======================================================
// 8. EXPLAIN EXCEPTION
// ======================================================

function explainException(exceptionId) {

    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }

    addAuditLog(
        exception,
        "Explanation requested"
    );


    const difference = Math.abs(
        exception.amount - exception.expectedAmount
    );


    const response = document.getElementById("aiResponse");

    if (!response) {
        return;
    }


    response.innerHTML = `

        <div class="analysis-box">

            <div class="analysis-title">
                AI Employee Explanation
            </div>

            <p>

                <strong>
                    ${exception.transactionId}
                </strong>

                was flagged because of

                <strong>
                    ${exception.category}
                </strong>.

            </p>


            <p style="margin-top:10px;">
                ${exception.reason}
            </p>


            <p style="margin-top:10px;">

                Invoice amount:

                <strong>
                    ₹${exception.amount.toLocaleString("en-IN")}
                </strong>

            </p>


            <p style="margin-top:10px;">

                Expected amount:

                <strong>
                    ₹${exception.expectedAmount.toLocaleString("en-IN")}
                </strong>

            </p>


            <p style="margin-top:10px;">

                Difference:

                <strong>
                    ₹${difference.toLocaleString("en-IN")}
                </strong>

            </p>


            <div class="analysis-confidence">

                AI Confidence:

                <strong>
                    ${exception.confidence}%
                </strong>

            </div>

        </div>
    `;


    refreshAuditTrail(exception);
}


// ======================================================
// 9. SUGGEST RESOLUTION
// ======================================================

function suggestResolution(exceptionId) {

    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }


    addAuditLog(
        exception,
        "Resolution suggested"
    );


    let recommendation;


    switch (exception.category) {

        case "Invoice Mismatch":
            recommendation =
                "Review the invoice amount against the approved purchase order before payment.";
            break;

        case "Duplicate Payment":
            recommendation =
                "Place the payment on hold and verify whether the previous payment was already processed.";
            break;

        case "Tax Mismatch":
            recommendation =
                "Send the transaction for manual tax verification before payment.";
            break;

        case "Quantity Mismatch":
            recommendation =
                "Verify the delivered quantity against the approved purchase order.";
            break;

        default:
            recommendation =
                "Send this exception for manual review.";
    }


    const response = document.getElementById("aiResponse");

    if (!response) {
        return;
    }


    response.innerHTML = `

        <div class="analysis-box">

            <div class="analysis-title">
                AI Employee Recommendation
            </div>

            <p>
                <strong>
                    Recommended Action
                </strong>
            </p>

            <p style="margin-top:10px;">
                ${recommendation}
            </p>

            <div class="analysis-confidence">

                Recommendation Confidence:

                <strong>
                    ${exception.confidence}%
                </strong>

            </div>

        </div>
    `;


    refreshAuditTrail(exception);
}


// ======================================================
// 10. AUTO RESOLVE
// ======================================================

function autoResolve(exceptionId) {

    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }


    if (!canAutoResolve(exception)) {

        alert(
            "Auto-resolution blocked. Confidence must be at least " +
            AUTO_RESOLVE_THRESHOLD +
            "%."
        );

        return;
    }


    exception.status = "resolved";


    addAuditLog(
        exception,
        "Automatically resolved"
    );


    renderExceptions();
    updateStats();
    showException(exception.id);
}


// ======================================================
// 11. REQUEST HUMAN REVIEW
// ======================================================

function requestHumanReview(exceptionId) {

    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }


    exception.status = "review";


    addAuditLog(
        exception,
        "Human review requested"
    );


    renderExceptions();
    updateStats();
    showException(exception.id);
}


// ======================================================
// 12. RESOLVE MANUALLY
// ======================================================
// NEW FLOW:
//
// Resolve Manually
//       ↓
// Review Panel
//       ↓
// Reviewer Note
//       ↓
// Approve Resolution
//       ↓
// Resolved
//       ↓
// Audit Trail
// ======================================================

function resolveManually(exceptionId) {

    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }


    if (exception.status === "resolved") {

        alert(
            "This exception is already resolved."
        );

        return;
    }


    // Add audit event
    addAuditLog(
        exception,
        "Manual resolution review opened"
    );


    // Create review panel
    showReviewPanel(exception);
}


// ======================================================
// 13. REVIEW PANEL
// ======================================================

function showReviewPanel(exception) {

    const details =
        document.getElementById("exceptionDetails");

    if (!details) {
        return;
    }


    const oldPanel =
        document.getElementById("manualReviewPanel");

    if (oldPanel) {
        oldPanel.remove();
    }


    const panel =
        document.createElement("div");

    panel.id = "manualReviewPanel";

    panel.className = "analysis-box";


    panel.innerHTML = `

        <div class="analysis-title">
            Manual Resolution Review
        </div>


        <p>
            <strong>
                ${exception.transactionId}
            </strong>
        </p>


        <p style="margin-top:10px;">
            Vendor:
            <strong>
                ${exception.vendor}
            </strong>
        </p>


        <p style="margin-top:10px;">
            Issue:
            <strong>
                ${exception.category}
            </strong>
        </p>


        <p style="margin-top:10px;">
            AI Reason:
            ${exception.reason}
        </p>


        <div style="margin-top:18px;">

            <label
                for="reviewerNote"
                style="display:block;margin-bottom:8px;"
            >
                Reviewer Note
            </label>


            <textarea
                id="reviewerNote"
                placeholder="Enter your reason for approving this resolution..."
                rows="4"
                style="width:100%;padding:12px;resize:vertical;"
            ></textarea>

        </div>


        <div
            class="action-buttons"
            style="margin-top:15px;"
        >

            <button
                class="btn secondary"
                onclick="cancelManualReview()"
            >
                Cancel
            </button>


            <button
                class="btn success"
                onclick="approveManualResolution('${exception.id}')"
            >
                Approve Resolution
            </button>

        </div>

    `;


    details.appendChild(panel);


    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ======================================================
// 14. CANCEL MANUAL REVIEW
// ======================================================

function cancelManualReview() {

    const panel =
        document.getElementById("manualReviewPanel");

    if (panel) {
        panel.remove();
    }
}


// ======================================================
// 15. APPROVE MANUAL RESOLUTION
// ======================================================

function approveManualResolution(exceptionId) {

    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }


    const note =
        document.getElementById("reviewerNote");


    if (!note) {
        return;
    }


    const reviewerNote =
        note.value.trim();


    // Reviewer note required
    if (!reviewerNote) {

        alert(
            "Please enter a reviewer note before approving the resolution."
        );

        note.focus();

        return;
    }


    // Change status
    exception.status = "resolved";


    // Store reviewer note
    exception.reviewerNote = reviewerNote;


    // Audit trail
    addAuditLog(
        exception,
        "Manual resolution approved by reviewer"
    );


    addAuditLog(
        exception,
        "Reviewer note: " + reviewerNote
    );


    // Remove review panel
    cancelManualReview();


    // Update dashboard
    renderExceptions();
    updateStats();


    // Show resolved exception
    showException(exception.id);
}


// ======================================================
// 16. REFRESH AUDIT TRAIL
// ======================================================

function refreshAuditTrail(exception) {

    const details =
        document.getElementById("exceptionDetails");

    if (!details) {
        return;
    }


    const oldAudit =
        details.querySelector(".audit-section");


    if (oldAudit) {

        oldAudit.outerHTML =
            buildAuditHTML(exception);

    }
}


// ======================================================
// 17. GET SELECTED EXCEPTION
// ======================================================

function getSelectedException() {

    const details =
        document.getElementById("exceptionDetails");

    if (!details) {
        return null;
    }


    if (details.classList.contains("hidden")) {
        return null;
    }


    const heading =
        details.querySelector("h2");

    if (!heading) {
        return null;
    }


    const transactionId =
        heading.textContent.trim();


    return exceptions.find(function (exception) {

        return (
            exception.transactionId ===
            transactionId
        );

    });
}


// ======================================================
// 18. SEND CHAT MESSAGE
// ======================================================

function sendChatMessage() {

    const input =
        document.getElementById("chatInput");

    if (!input) {
        return;
    }


    const message =
        input.value.trim();

    if (!message) {
        return;
    }


    const exception =
        getSelectedException();


    if (!exception) {

        addChatMessage(
            "assistant",
            "Please select an exception from the queue first."
        );

        input.value = "";

        return;
    }


    addChatMessage(
        "user",
        message
    );


    input.value = "";


    addAuditLog(
        exception,
        "AI Employee chat interaction"
    );


    const response =
        generateChatResponse(
            message,
            exception
        );


    setTimeout(function () {

        addChatMessage(
            "assistant",
            response
        );

    }, 300);
}


// ======================================================
// 19. AI CHAT RESPONSE
// ======================================================

function generateChatResponse(message, exception) {

    const question =
        message.toLowerCase();


    // WHY FLAGGED

    if (
        question.includes("why") ||
        question.includes("flagged") ||
        question.includes("reason")
    ) {

        return `

            <strong>
                ${exception.transactionId}
            </strong>

            was flagged because of

            <strong>
                ${exception.category}
            </strong>.

            <br><br>

            ${exception.reason}

            <br><br>

            Invoice amount:
            <strong>
                ₹${exception.amount.toLocaleString("en-IN")}
            </strong>

            <br>

            Expected amount:
            <strong>
                ₹${exception.expectedAmount.toLocaleString("en-IN")}
            </strong>

        `;
    }


    // AUTO RESOLVE

    if (
        question.includes("auto") ||
        question.includes("automatically")
    ) {

        if (canAutoResolve(exception)) {

            return `

                Yes. This exception is eligible
                for automatic resolution.

                <br><br>

                Confidence:
                <strong>
                    ${exception.confidence}%
                </strong>

                <br>

                Required threshold:
                <strong>
                    ${AUTO_RESOLVE_THRESHOLD}%
                </strong>

            `;

        }


        return `

            No. Automatic resolution is blocked.

            <br><br>

            Current confidence:
            <strong>
                ${exception.confidence}%
            </strong>

            <br>

            Required threshold:
            <strong>
                ${AUTO_RESOLVE_THRESHOLD}%
            </strong>

            <br><br>

            A human reviewer should handle
            this exception.

        `;
    }


    // RECOMMENDATION

    if (
        question.includes("recommend") ||
        question.includes("suggest") ||
        question.includes("should")
    ) {

        switch (exception.category) {

            case "Invoice Mismatch":
                return "I recommend comparing the invoice with the approved purchase order before payment.";

            case "Duplicate Payment":
                return "I recommend placing the payment on hold and checking whether the previous payment was already processed.";

            case "Tax Mismatch":
                return "I recommend sending this transaction for manual tax verification.";

            case "Quantity Mismatch":
                return "I recommend verifying the delivered quantity against the approved purchase order.";

            default:
                return "I recommend sending this exception for manual review.";
        }
    }


    // CONFIDENCE

    if (
        question.includes("confidence") ||
        question.includes("certain")
    ) {

        return `

            The AI confidence is

            <strong>
                ${exception.confidence}%
            </strong>.

            <br><br>

            Automatic resolution requires

            <strong>
                ${AUTO_RESOLVE_THRESHOLD}%
            </strong>

            or higher.

        `;
    }


    // STATUS

    if (question.includes("status")) {

        return `

            The current status of

            <strong>
                ${exception.transactionId}
            </strong>

            is

            <strong>
                ${exception.status}
            </strong>.

        `;
    }


    // MANUAL RESOLUTION

    if (
        question.includes("manual") ||
        question.includes("human")
    ) {

        return `

            You can manually resolve this exception
            using the

            <strong>
                Resolve Manually
            </strong>

            button.

            <br><br>

            The reviewer will be asked to enter
            a note before approving the resolution.

        `;
    }


    // AUDIT

    if (
        question.includes("audit") ||
        question.includes("history") ||
        question.includes("log")
    ) {

        return `

            This exception currently has

            <strong>
                ${exception.auditLog.length}
            </strong>

            audit event(s).

            <br><br>

            You can view the complete history
            in the Audit Trail section.

        `;
    }


    // DEFAULT

    return `

        I can help investigate this exception.

        <br><br>

        Try asking:

        <br><br>

        • Why was this flagged?

        <br>

        • Can this be auto-resolved?

        <br>

        • What do you recommend?

        <br>

        • What is the confidence?

        <br>

        • What is the status?

        <br>

        • Can I resolve this manually?

        <br>

        • Show me the audit history.

    `;
}


// ======================================================
// 20. ADD CHAT MESSAGE
// ======================================================

function addChatMessage(sender, message) {

    const chat =
        document.getElementById("chatMessages");

    if (!chat) {
        return;
    }


    const messageContainer =
        document.createElement("div");


    messageContainer.className =
        "chat-message " + sender;


    const label =
        sender === "user"
            ? "You"
            : "AI Employee";


    messageContainer.innerHTML = `

        <div class="message-label">
            ${label}
        </div>

        <div class="message-bubble">
            ${message}
        </div>

    `;


    chat.appendChild(
        messageContainer
    );


    chat.scrollTop =
        chat.scrollHeight;
}


// ======================================================
// 21. CHAT ENTER KEY
// ======================================================

function setupChatInput() {

    const input =
        document.getElementById("chatInput");

    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendChatMessage();

            }

        }
    );
}


// ======================================================
// 22. INITIALIZE APPLICATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderExceptions();

        updateStats();

        setupChatInput();

        console.log(
            "ResolveAI initialized successfully."
        );

    }
);