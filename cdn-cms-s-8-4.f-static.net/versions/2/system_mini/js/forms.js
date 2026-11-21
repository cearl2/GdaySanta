const form = document.getElementById('orderForm');

if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('.order-submit-text');
    const status = document.getElementById('orderStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (status) {
            status.classList.add('hidden');
            status.classList.remove('success', 'error');
            status.textContent = '';
        }

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

            if (response.status !== 200 || !data.success) {
                throw new Error(data.message || "We couldn't send your order. Please try again.");
            }

            // TODO: Replace these placeholders and re-enable Stripe checkout when ready.
            // const familyCheckoutUrl = "FAMILY_STRIPE_CHECKOUT_URL_PLACEHOLDER";
            // const singleCheckoutUrl = "SINGLE_STRIPE_CHECKOUT_URL_PLACEHOLDER";
            // window.location.assign(checkoutUrl);

            if (status) {
                status.classList.remove('hidden', 'error', 'success');
                status.classList.add('success');
                status.textContent = "Your details were submitted successfully. No payment has been taken because checkout is not available yet.";
            }
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