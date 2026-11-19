const form = document.getElementById('orderForm');

if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('.order-submit-text');
    const status = document.getElementById('orderStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        formData.append("access_key", "db8cd445-ed6b-4b73-8d10-23cad811f5a6");

        const originalText = submitText ? submitText.textContent : submitBtn.textContent;
        submitBtn.disabled = true;
        if (submitText) {
            submitText.textContent = "Sending...";
        } else {
            submitBtn.textContent = "Sending...";
        }

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "We couldn't send your order. Please try again.");
            }

            if (status) {
                status.classList.remove('hidden', 'error');
                status.classList.add('success');
                status.textContent = "Success! Your order has been sent.";
            }
            form.reset();
        } catch (error) {
            if (status) {
                status.classList.remove('hidden', 'success');
                status.classList.add('error');
                status.textContent = error.message || "Something went wrong. Please try again.";
            } else {
                alert(error.message || "Something went wrong. Please try again.");
            }
        } finally {
            if (submitText) {
                submitText.textContent = originalText;
            } else {
                submitBtn.textContent = originalText;
            }
            submitBtn.disabled = false;
        }
    });
}