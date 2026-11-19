// Explain: Handles navigation, form validation, dynamic form updates, and order submission logic.
document.addEventListener('DOMContentLoaded', function() {
    var menuToggle = document.getElementById('menuToggle');
    var menuIcon = document.getElementById('menuIcon');
    var mobileMenu = document.getElementById('mobileMenu');
    var orderForm = document.getElementById('orderForm');
    var orderStatus = document.getElementById('orderStatus');
    var orderConfirmation = document.getElementById('orderConfirmation');
    var orderSubmit = document.querySelector('.order-submit');
    var orderSubmitText = document.querySelector('.order-submit-text');
    var confirmationName = document.getElementById('confirmationName');
    var confirmationOrder = document.getElementById('confirmationOrder');
    var confirmationTotal = document.getElementById('confirmationTotal');
    var childSingle = document.getElementById('childSingle');
    var childFamily = document.getElementById('childFamily');
    var childRows = document.getElementById('childRows');
    var addChildBtn = document.getElementById('addChildBtn');

    function setMenuOpen(isOpen) {
        if (!mobileMenu || !menuToggle) {
            return;
        }
        mobileMenu.classList.toggle('hidden', !isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        if (menuIcon) {
            menuIcon.className = isOpen ? 'fa-solid fa-xmark text-lg' : 'fa-solid fa-bars text-lg';
        }
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
        });

        mobileMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                setMenuOpen(false);
            });
        });

        document.addEventListener('click', function(event) {
            if (mobileMenu.classList.contains('hidden')) {
                return;
            }
            if (mobileMenu.contains(event.target) || menuToggle.contains(event.target)) {
                return;
            }
            setMenuOpen(false);
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        });
    }

    function showOrderStatus(type, message) {
        if (!orderStatus) {
            return;
        }
        orderStatus.classList.remove('hidden', 'success', 'error');
        orderStatus.classList.add(type);
        orderStatus.textContent = message;
    }

    function clearOrderStatus() {
        if (!orderStatus) {
            return;
        }
        orderStatus.classList.add('hidden');
        orderStatus.classList.remove('success', 'error');
        orderStatus.textContent = '';
    }

    function setOrderSending(isSending) {
        if (orderSubmit) {
            orderSubmit.disabled = isSending;
        }
        if (orderSubmitText) {
            orderSubmitText.textContent = isSending ? 'Sending to the North Pole…' : 'Place my order';
        }
    }

    function focusField(field) {
        if (field && typeof field.focus === 'function') {
            field.focus();
        }
    }

    function getFamilyChildren() {
        var children = [];
        if (!childRows) {
            return children;
        }
        childRows.querySelectorAll('.child-row').forEach(function(row) {
            var nameField = row.querySelector('[name="familyChildName"]');
            var ageField = row.querySelector('[name="familyChildAge"]');
            var detailField = row.querySelector('[name="familyChildDetail"]');
            children.push({
                name: nameField ? nameField.value.trim() : '',
                age: ageField ? ageField.value.trim() : '',
                detail: detailField ? detailField.value.trim() : ''
            });
        });
        return children;
    }

    function updateChildRemoveButtons() {
        if (!childRows) {
            return;
        }
        var rows = childRows.querySelectorAll('.child-row');
        rows.forEach(function(row) {
            var removeBtn = row.querySelector('.child-remove');
            if (removeBtn) {
                var isOnlyOne = rows.length < 2;
                removeBtn.disabled = isOnlyOne;
                removeBtn.classList.toggle('opacity-40', isOnlyOne);
            }
        });
        if (addChildBtn) {
            var atLimit = rows.length >= 6;
            addChildBtn.disabled = atLimit;
            addChildBtn.classList.toggle('opacity-40', atLimit);
        }
    }

    function addFamilyChildRow() {
        if (!childRows) {
            return;
        }
        var firstRow = childRows.querySelector('.child-row');
        if (!firstRow) {
            return;
        }
        var newRow = firstRow.cloneNode(true);
        newRow.querySelectorAll('input, textarea').forEach(function(field) {
            field.value = '';
        });
        childRows.appendChild(newRow);
        updateChildRemoveButtons();
    }

    function syncChildFields() {
        if (!orderForm) {
            return;
        }
        var familyUid = orderForm.getAttribute('data-family-uid') || '';
        var checked = orderForm.querySelector('[name="packageChoice"]:checked');
        var isFamily = familyUid !== '' && checked && checked.value === familyUid;
        if (childSingle) {
            childSingle.classList.toggle('hidden', isFamily);
        }
        if (childFamily) {
            childFamily.classList.toggle('hidden', !isFamily);
        }
        if (isFamily && childRows && childRows.querySelectorAll('.child-row').length === 0) {
            addFamilyChildRow();
        }
    }

    function showOrderConfirmation(response, childName) {
        if (confirmationName) {
            confirmationName.textContent = childName;
        }
        if (confirmationOrder) {
            confirmationOrder.textContent = response.orderID ? 'Order ' + response.orderID : '';
        }
        if (confirmationTotal) {
            var amount = Number(response.totalPrice);
            if (!isNaN(amount) && amount > 0 && window.CurrencySystem && typeof window.CurrencySystem.format === 'function') {
                confirmationTotal.textContent = window.CurrencySystem.format(amount);
            } else {
                confirmationTotal.textContent = '';
            }
        }
        if (orderForm) {
            orderForm.classList.add('hidden');
        }
        if (orderConfirmation) {
            orderConfirmation.classList.remove('hidden');
            if (typeof orderConfirmation.scrollIntoView === 'function') {
                orderConfirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    if (addChildBtn) {
        addChildBtn.addEventListener('click', function() {
            addFamilyChildRow();
        });
    }

    if (childRows) {
        childRows.addEventListener('click', function(event) {
            if (!event.target || typeof event.target.closest !== 'function') {
                return;
            }
            var removeBtn = event.target.closest('.child-remove');
            if (!removeBtn || removeBtn.disabled) {
                return;
            }
            var row = removeBtn.closest('.child-row');
            if (row) {
                row.remove();
                updateChildRemoveButtons();
            }
        });
        updateChildRemoveButtons();
    }

    if (orderForm) {
        orderForm.querySelectorAll('[name="packageChoice"]').forEach(function(radio) {
            radio.addEventListener('change', syncChildFields);
        });
        syncChildFields();

        orderForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (orderForm.hasAttribute('data-submit-via-web3forms')) {
                return;
            }
            clearOrderStatus();

            if (!window.OrderSystem || typeof window.OrderSystem.submitProductOrder !== 'function') {
                showOrderStatus('error', 'Checkout is unavailable right now. Please refresh the page and try again.');
                return;
            }

            var packageChoice = orderForm.querySelector('[name="packageChoice"]:checked');
            var productUid = packageChoice ? packageChoice.value : orderForm.getAttribute('data-product-uid');
            if (!productUid) {
                showOrderStatus('error', 'This letter package is not available right now. Please try again shortly.');
                return;
            }

            var familyUid = orderForm.getAttribute('data-family-uid') || '';
            var isFamily = familyUid !== '' && productUid === familyUid;

            var addressField = orderForm.querySelector('[name="address"]');
            var cityField = orderForm.querySelector('[name="city"]');
            var stateField = orderForm.querySelector('[name="stateCode"]');
            var postcodeField = orderForm.querySelector('[name="postcode"]');
            var buyerNameField = orderForm.querySelector('[name="buyerName"]');
            var emailField = orderForm.querySelector('[name="buyerEmail"]');
            var phoneField = orderForm.querySelector('[name="buyerPhone"]');

            var childName = '';
            var childAge = '';
            var childDetail = '';
            var childFamilyNames = '';
            var familyChildren = [];

            if (isFamily) {
                familyChildren = getFamilyChildren();
                if (familyChildren.length === 0) {
                    showOrderStatus('error', 'Add at least one child to the family letter pack.');
                    return;
                }
                var badIndex = -1;
                var badKind = '';
                for (var c = 0; c < familyChildren.length; c++) {
                    if (familyChildren[c].name.length < 2) { badIndex = c; badKind = 'name'; break; }
                    if (familyChildren[c].detail.length < 4) { badIndex = c; badKind = 'detail'; break; }
                }
                if (badIndex !== -1) {
                    showOrderStatus('error', badKind === 'name' ? 'Add a first name for every child so Santa knows who to write to.' : 'Add a small detail for every child so Santa can mention something special.');
                    var badRow = childRows ? childRows.querySelectorAll('.child-row')[badIndex] : null;
                    if (badRow) {
                        focusField(badRow.querySelector(badKind === 'name' ? '[name="familyChildName"]' : '[name="familyChildDetail"]'));
                    }
                    return;
                }
                childName = familyChildren[0].name;
            } else {
                var childNameField = orderForm.querySelector('[name="childName"]');
                var childDetailField = orderForm.querySelector('[name="childDetail"]');
                var ageField = orderForm.querySelector('[name="childAge"]');
                var childFamilyNamesField = orderForm.querySelector('[name="childFamilyNames"]');

                childName = childNameField ? childNameField.value.trim() : '';
                childAge = ageField ? ageField.value.trim() : '';
                childDetail = childDetailField ? childDetailField.value.trim() : '';
                childFamilyNames = childFamilyNamesField ? childFamilyNamesField.value.trim() : '';

                if (childName.length < 2) {
                    showOrderStatus('error', "Please add your child's first name so Santa knows who to write to.");
                    focusField(childNameField);
                    return;
                }

                if (childDetail.length < 4) {
                    showOrderStatus('error', 'Add one small detail for Santa to mention — a hobby, a pet, or something they are proud of.');
                    focusField(childDetailField);
                    return;
                }
            }

            var address = addressField ? addressField.value.trim() : '';
            var city = cityField ? cityField.value.trim() : '';
            var stateCode = stateField ? stateField.value : '';
            var postcode = postcodeField ? postcodeField.value.trim() : '';
            var buyerName = buyerNameField ? buyerNameField.value.trim() : '';
            var email = emailField ? emailField.value.trim() : '';
            var phone = phoneField ? phoneField.value.trim() : '';

            if (address.length < 5) {
                showOrderStatus('error', 'Please add the street address so the letter reaches the right letterbox.');
                focusField(addressField);
                return;
            }

            if (city.length < 2) {
                showOrderStatus('error', 'Please add a suburb or city for the delivery address.');
                focusField(cityField);
                return;
            }

            if (!stateCode) {
                showOrderStatus('error', 'Please choose a state for the delivery address.');
                focusField(stateField);
                return;
            }

            if (!/^\d{4}$/.test(postcode)) {
                showOrderStatus('error', 'Please enter a 4-digit Australian postcode.');
                focusField(postcodeField);
                return;
            }

            if (buyerName.length < 2) {
                showOrderStatus('error', 'Please add your name so we know who ordered the letter.');
                focusField(buyerNameField);
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                showOrderStatus('error', 'Please add a valid email address so we can send your confirmation.');
                focusField(emailField);
                return;
            }

            var nameParts = buyerName.split(/\s+/);
            var firstName = nameParts.shift() || buyerName;
            var lastName = nameParts.join(' ');

            setOrderSending(true);

            var contactFields = [];
            if (isFamily) {
                familyChildren.forEach(function(child, index) {
                    contactFields.push({ label: 'Child ' + (index + 1) + ' name', value: child.name, type: 'text' });
                    if (child.age) {
                        contactFields.push({ label: 'Child ' + (index + 1) + ' age', value: child.age, type: 'text' });
                    }
                    contactFields.push({ label: 'Child ' + (index + 1) + ' detail for Santa', value: child.detail, type: 'textarea' });
                });
            } else {
                contactFields.push({ label: "Child's first name", value: childName, type: 'text' });
                contactFields.push({ label: "Child's age", value: childAge, type: 'text' });
                contactFields.push({ label: 'Detail for Santa to mention', value: childDetail, type: 'textarea' });
                contactFields.push({ label: "Sharing Christmas with", value: childFamilyNames, type: 'text' });
            }
            var replyChoiceField = orderForm.querySelector('[name="replyChoice"]:checked');
            if (replyChoiceField) {
                contactFields.push({ label: "How Santa's reply is sent", value: replyChoiceField.getAttribute('data-label') || replyChoiceField.value, type: 'text' });
            }
            contactFields.push({ label: 'Delivery address', value: address + ', ' + city + ' ' + stateCode + ' ' + postcode, type: 'textarea' });
            contactFields.push({ label: 'Ordered by', value: buyerName, type: 'text' });
            contactFields.push({ label: 'Email', value: email, type: 'email' });
            contactFields.push({ label: 'Phone', value: phone, type: 'tel' });
            contactFields.push({ label: 'Country', value: 'AU', type: 'text' });

            window.OrderSystem.submitProductOrder(
                productUid,
                contactFields,
                {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone,
                    address: address,
                    city: city,
                    zip: postcode,
                    countryCode: 'AU',
                    stateCode: stateCode,
                    amount: 1
                }
            ).then(function(response) {
                if (response && response.success) {
                    var confirmationLabel = isFamily
                        ? familyChildren.map(function(child) { return child.name; }).join(' and ')
                        : childName;
                    showOrderConfirmation(response, confirmationLabel);
                } else {
                    showOrderStatus('error', response && response.error ? response.error : 'We could not complete your order. Please check your details and try again.');
                }
            }).catch(function() {
                showOrderStatus('error', 'We could not reach checkout just now. Please check your connection and try again.');
            }).finally(function() {
                setOrderSending(false);
            });
        });
    }
});