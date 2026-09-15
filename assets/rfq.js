const form = document.querySelector('#rfq-form');
if (form) {
  const config = JSON.parse(document.querySelector('#site-config').textContent);
  const status = document.querySelector('#form-status');
  const button = document.querySelector('#submit-rfq');
  const fields = document.querySelector('#rfq-fields');
  const accessKey = form.elements.namedItem('access_key');
  const lineSelect = form.elements.namedItem('business-line');
  const line = new URLSearchParams(location.search).get('line');
  const initialLine = [...lineSelect.options].some(option => option.value === line) ? line : '';
  lineSelect.value = initialLine;
  const originalButton = button.innerHTML;
  const failureMessage = `Unable to submit your inquiry. Please try again or email ${config.email}.`;
  let submitting = false;
  button.disabled = false;

  function showStatus(state, message, title = '') {
    status.replaceChildren();
    status.hidden = false;
    status.dataset.state = state;
    if (title) {
      const heading = document.createElement('strong');
      heading.textContent = title;
      status.append(heading);
    }
    const text = document.createElement('p');
    text.textContent = message;
    status.append(text);
  }

  form.addEventListener('input', () => {
    if (!submitting) status.hidden = true;
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    if (!accessKey.value.trim() || form.elements.namedItem('botcheck').checked) {
      showStatus('error', failureMessage);
      status.focus();
      return;
    }

    // Collect before disabling the fieldset: disabled fields are excluded from FormData.
    const payload = Object.fromEntries(new FormData(form));
    payload.subject = `Website RFQ — ${payload.company.trim()} — ${payload['business-line']}`;
    payload.from_name = `${config.name} Website`;
    submitting = true;
    button.disabled = true;
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending...';
    showStatus('sending', 'Submitting your inquiry...');
    const controller = new AbortController();
    // No automatic retry: a timed-out request may have reached the service.
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission rejected');
      form.reset();
      lineSelect.value = initialLine;
      showStatus('success', 'Thank you for contacting us. Your inquiry has been received by our submission system and will be reviewed by our sales team.', '✓ Inquiry Submitted');
    } catch {
      // Preserve all entries on rejection, timeout, malformed response or connection failure.
      showStatus('error', failureMessage);
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      button.disabled = false;
      fields.disabled = false;
      button.innerHTML = originalButton;
      form.removeAttribute('aria-busy');
      status.focus();
    }
  });
}
