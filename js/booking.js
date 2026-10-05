/**
 * PIVOT AIDE TAX — BOOKING & CONSULTATION HANDLER
 * Provides interactive scheduling modal for consultations, scoping calls,
 * Second Look reviews, and urgent notice triage with document/PDF upload support.
 */

// Formspree / FormSubmit endpoint configuration:
// When client provides Formspree endpoint, insert it below (e.g. 'https://formspree.io/f/YOUR_ID')
window.PIVOT_AIDE_FORMSPREE_ENDPOINT = '';

window.openBookingModal = function(serviceType = 'general') {
  if (serviceType === 'consultation') {
    window.open('https://pivotaide.odoo.com/appointment/1', '_blank', 'noopener');
    return;
  }
  let modal = document.getElementById('booking-modal');
  if (!modal) {
    createBookingModalDOM();
    modal = document.getElementById('booking-modal');
  }

  // Pre-select service in dropdown
  const select = modal.querySelector('#booking-service');
  if (select && serviceType) {
    for (let opt of select.options) {
      if (opt.value === serviceType || opt.value.includes(serviceType)) {
        select.value = opt.value;
        break;
      }
    }
  }

  if (typeof updateBookingFilePrompt === 'function') {
    updateBookingFilePrompt(modal, select ? select.value : serviceType);
  }

  openModal('booking-modal');
};

window.handleServiceChange = function(select) {
  if (select.value === 'consultation') {
    window.open('https://pivotaide.odoo.com/appointment/1', '_blank', 'noopener');
  }
  const modal = select.closest('.modal-panel') || document.getElementById('booking-modal');
  if (modal && typeof updateBookingFilePrompt === 'function') {
    updateBookingFilePrompt(modal, select.value);
  }
};

window.updateBookingFilePrompt = function(container, serviceValue) {
  if (!container) return;
  const label = container.querySelector('#booking-file-label') || container.querySelector('#page-booking-file-label');
  const sub = container.querySelector('#booking-file-sub') || container.querySelector('#page-booking-file-sub');
  if (!label || !sub) return;

  if (serviceValue === 'triage') {
    label.innerHTML = 'Upload IRS / State Notice <span style="font-weight:600;color:var(--blue);font-size:0.75rem;text-transform:none">(Recommended for 2-Day Triage)</span>';
    sub.textContent = 'Attach your IRS letter (CP2000, 5071C, notice of deficiency, or state letter)';
  } else if (serviceValue === 'second-look') {
    label.innerHTML = 'Upload Prior Return <span style="font-weight:400;color:var(--ink-2);font-size:0.75rem;text-transform:none">(Optional &middot; PDF or Scan)</span>';
    sub.textContent = 'Upload up to 3 years of filed returns for forensic review';
  } else {
    label.innerHTML = 'Upload Notice or Document <span style="font-weight:400;color:var(--ink-2);font-size:0.75rem;text-transform:none">(Optional &middot; PDF, Images &middot; Max 10MB)</span>';
    sub.textContent = 'IRS letter, tax form, or prior return (PDF, PNG, JPG, DOC)';
  }
};

window.handleFileSelected = function(input, labelId, subId) {
  const label = document.getElementById(labelId);
  const sub = subId ? document.getElementById(subId) : null;
  const box = input.closest('.file-upload-box') || (input.parentElement ? input.parentElement.querySelector('.file-upload-box') : null);
  if (!label) return;

  if (input.files && input.files[0]) {
    const file = input.files[0];
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    label.innerHTML = `<span style="color:var(--ok,#1f8a54);font-weight:600">&#10003; Document Attached:</span> <span style="color:var(--ink);font-weight:500">${file.name}</span>`;
    if (sub) {
      sub.innerHTML = `File size: <strong>${sizeMb} MB</strong> &middot; Click to change or drag another file`;
    }
    if (box) {
      box.style.borderColor = 'var(--blue)';
      box.style.background = 'rgba(1, 159, 255, 0.06)';
    }
  } else {
    label.textContent = 'Choose a PDF or drag & drop here';
    if (sub) {
      sub.textContent = 'IRS letter, CP2000, 5071C, state notice, or prior return';
    }
    if (box) {
      box.style.borderColor = 'var(--line)';
      box.style.background = 'var(--wash, #F8FAFC)';
    }
  }
};

window.setupFileDropZone = function(box, inputId, labelId, subId) {
  if (!box || box._dragReady) return;
  box._dragReady = true;

  ['dragenter', 'dragover'].forEach(function(eventName) {
    box.addEventListener(eventName, function(e) {
      e.preventDefault();
      e.stopPropagation();
      box.style.borderColor = 'var(--blue)';
      box.style.background = 'rgba(1, 159, 255, 0.12)';
    });
  });

  ['dragleave', 'drop'].forEach(function(eventName) {
    box.addEventListener(eventName, function(e) {
      e.preventDefault();
      e.stopPropagation();
      box.style.borderColor = 'var(--line)';
      box.style.background = 'var(--wash, #F8FAFC)';
    });
  });

  box.addEventListener('drop', function(e) {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length) {
      const input = document.getElementById(inputId);
      if (input) {
        input.files = dt.files;
        handleFileSelected(input, labelId, subId);
      }
    }
  });
};

function createBookingModalDOM() {
  const modalDiv = document.createElement('div');
  modalDiv.id = 'booking-modal';
  modalDiv.className = 'modal-backdrop';
  modalDiv.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <div>
          <span class="eyebrow">Pivot Aide Tax</span>
          <h3 id="modal-title" style="margin-top:2px">Schedule Your Strategy Session</h3>
        </div>
        <button type="button" class="modal-close" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="booking-form" action="https://formsubmit.co/Tax@pivotaide.com" method="POST" enctype="multipart/form-data" onsubmit="handleBookingSubmit(event)">
          <input type="hidden" name="_subject" value="Pivot Aide Tax — Consultation / Notice Triage Request">
          <input type="hidden" name="_captcha" value="false">
          <input type="hidden" name="_template" value="table">
          <div class="form-group">
            <label class="form-label" for="booking-service">Service / Consultation Type</label>
            <select id="booking-service" name="service" class="form-control" required onchange="handleServiceChange(this)">
              <option value="scoping">The Standing File — 45-Minute Scoping Call (Free)</option>
              <option value="second-look">Second Look — 3-Year Prior Return Review (Free)</option>
              <option value="triage">Notice Triage — IRS / State Letter Review ($0 Review)</option>
              <option value="consultation">General Tax Consultation (1 Hour, Free) — [Redirects to Odoo]</option>
              <option value="quickprepare">QuickPrepare Filing ($295 Deposit)</option>
              <option value="business">Business & Bookkeeping Onboarding</option>
            </select>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group">
              <label class="form-label" for="booking-name">Full Name</label>
              <input type="text" id="booking-name" name="name" class="form-control" placeholder="Jane Doe" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="booking-phone">Phone Number</label>
              <input type="tel" id="booking-phone" name="phone" class="form-control" placeholder="(571) 000-0000" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="booking-email">Email Address</label>
            <input type="email" id="booking-email" name="email" class="form-control" placeholder="jane@example.com" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="booking-notes">Brief Overview of Your Situation</label>
            <textarea id="booking-notes" name="notes" class="form-control" rows="3" placeholder="Tell us about your tax filing, business entity, or any letter received..."></textarea>
          </div>

          <div class="form-group" id="booking-file-group">
            <label class="form-label" id="booking-file-label" for="booking-file">Upload Notice or Document <span style="font-weight:400;color:var(--ink-2);font-size:0.75rem;text-transform:none">(PDF, Images &middot; Max 10MB)</span></label>
            <div class="file-upload-box" id="booking-dropzone" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border:1.5px dashed var(--line);border-radius:var(--r);background:var(--wash,#F8FAFC);cursor:pointer;transition:border-color var(--transition-fast), background var(--transition-fast);" onclick="document.getElementById('booking-file').click()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div style="flex:1;min-width:0">
                <div id="booking-file-name" style="font-size:0.86rem;font-weight:500;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  Choose a PDF or drag &amp; drop here
                </div>
                <div id="booking-file-sub" style="font-size:0.75rem;color:var(--ink-2);margin-top:2px">
                  IRS letter, CP2000, 5071C, state notice, or prior return
                </div>
              </div>
              <button type="button" class="btn btn-o" style="padding:5px 12px;font-size:0.78rem;pointer-events:none;flex:none">Browse</button>
            </div>
            <input type="file" id="booking-file" name="attachment" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" style="display:none" onchange="handleFileSelected(this, 'booking-file-name', 'booking-file-sub')">
          </div>

          <div class="callout" style="margin-bottom:18px;font-size:.82rem">
            <span class="h">Our Commitment</span>
            <p>We do not sell client data, we do not employ aggressive sales reps, and we review submissions within two business days.</p>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" class="btn btn-o modal-close">Cancel</button>
            <button type="submit" class="btn btn-p">Confirm Consultation Request &rarr;</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  setupFileDropZone(modalDiv.querySelector('#booking-dropzone'), 'booking-file', 'booking-file-name', 'booking-file-sub');
}

window.handleBookingSubmit = function(e) {
  e.preventDefault();
  const form = e.target;

  // Gather fields
  const nameInput  = form.querySelector('#booking-name')  || form.querySelector('#page-booking-name')  || form.querySelector('input[name="name"]');
  const emailInput = form.querySelector('#booking-email') || form.querySelector('#page-booking-email') || form.querySelector('input[name="email"]');
  const phoneInput = form.querySelector('#booking-phone') || form.querySelector('#page-booking-phone') || form.querySelector('input[name="phone"]');
  const notesInput = form.querySelector('#booking-notes') || form.querySelector('#page-booking-notes') || form.querySelector('textarea[name="notes"]');
  const serviceSelect = form.querySelector('#booking-service') || form.querySelector('#page-booking-service') || form.querySelector('select[name="service"]');
  const fileInput  = form.querySelector('input[type="file"]');

  const name    = nameInput    ? nameInput.value    : 'Taxpayer';
  const email   = emailInput   ? emailInput.value   : '';
  const phone   = phoneInput   ? phoneInput.value   : '';
  const notes   = notesInput   ? notesInput.value   : '';
  const service = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : 'General Inquiry';
  const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

  // Build FormData payload (compatible with both Formspree and FormSubmit, supports file attachments)
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('service', service);
  formData.append('notes', notes);
  formData.append('_subject', 'Pivot Aide Tax — Appointment / Notice Request: ' + service);
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');

  if (hasFile) {
    formData.append('attachment', fileInput.files[0]);
  }

  // Show sending state
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = hasFile ? 'Uploading Letter\u2026' : 'Sending\u2026';
  }

  // Target endpoint: Formspree (if configured) or fallback to FormSubmit
  const targetEndpoint = window.PIVOT_AIDE_FORMSPREE_ENDPOINT || form.getAttribute('action') || 'https://formsubmit.co/Tax@pivotaide.com';
  const submitUrl = targetEndpoint.includes('formsubmit.co') && !targetEndpoint.includes('/ajax/')
    ? targetEndpoint.replace('formsubmit.co/', 'formsubmit.co/ajax/')
    : targetEndpoint;

  fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    },
    body: formData
  })
    .then(function(res) {
      showBookingSuccess(form, name, email);
    })
    .catch(function() {
      // Fallback
      fetch(targetEndpoint, { method: 'POST', body: formData, mode: 'no-cors' })
        .finally(function() {
          showBookingSuccess(form, name, email);
        });
    });
};

function showBookingSuccess(form, name, email) {
  const modalBody = form.closest('.modal-body') || form.closest('.card') || form.parentElement;
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="text-align:center;padding:24px 12px">
        <div style="width:52px;height:52px;border-radius:50%;background:rgba(31,138,84,.15);color:var(--ok);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:1.8rem">
          &#10003;
        </div>
        <h3 style="font-size:1.35rem">Consultation Request Received</h3>
        <p class="small" style="margin-top:8px;max-width:44ch;margin-left:auto;margin-right:auto">
          Thank you, <strong>${name}</strong>. An advisor from Pivot Aide Tax will reach out to <strong>${email}</strong> within two business days to confirm your appointment time and prepare your intake.
        </p>
        <div style="margin-top:24px">
          <button type="button" class="btn btn-g" onclick="typeof closeModal === 'function' ? closeModal('booking-modal') : location.reload()">Close</button>
        </div>
      </div>
    `;
  }
}


window.viewChecklist = function(tradeName) {
  const checklists = {
    'Realtor': {
      title: 'Realtors & Real Estate Brokers',
      items: [
        'Desk fees, brokerage splits, and E&O liability insurance',
        'MLS dues, local board fees, and national association dues',
        'Staging furniture, professional photography, virtual tours, drone videography',
        'Business mileage (67¢/mile for TY 2026) or actual auto lease expenses',
        'Client closing gifts (subject to $25 per recipient statutory limit under IRC §274)',
        'Continuing professional education (CE), licensing renewals, exam fees',
        'Open house hospitality, promotional signage, lockboxes, and yard stakes'
      ]
    },
    'Contractor': {
      title: 'Contractors & Construction Trades',
      items: [
        'Section 179 first-year full expensing on heavy machinery and work trucks',
        'Hand tools, power equipment, safety gear, steel-toed boots, and PPE',
        'Subcontractor 1099-NEC payments and worker compensation premiums',
        'Job site temporary power, dumpster rentals, portable sanitation units',
        'Materials, fasteners, lumber, and specialized equipment rentals',
        'Builder’s risk insurance, general commercial liability, bonding fees'
      ]
    },
    'Trucker': {
      title: 'Truckers & Owner-Operators',
      items: [
        'Special per diem meal allowance (80% deductible rate for DOT hours-of-service)',
        'Heavy Highway Vehicle Use Tax (Form 2290 compliance and payment)',
        'International Fuel Tax Agreement (IFTA) state diesel road taxes',
        'Electronic Logging Device (ELD) hardware and telematics subscriptions',
        'Sleeper berth bedding, cab inverter, mini-refrigerator, CB radio gear',
        'Tire chain sets, load locks, straps, tarps, and truck wash expenses'
      ]
    },
    'Healthcare': {
      title: 'Home Care & Nursing Agencies',
      items: [
        'Disposable medical gloves, blood pressure monitors, sanitizing agents, scrubs',
        'Caregiver CPR/BLS certification renewals and state background checks',
        'Accountable plan mileage reimbursements for travel between client homes',
        'Professional nursing liability insurance and healthcare agency licensing',
        'HIPAA-compliant scheduling software and secure charting subscriptions'
      ]
    },
    'Salon': {
      title: 'Salons, Barbers & Stylists',
      items: [
        'Weekly or monthly booth rental / station chair lease payments',
        'Professional shears, clippers, trimmers, blades, and sharpening services',
        'Backbar shampoos, conditioners, developer, dyes, foil, and cape laundry',
        'Autoclaves, Barbicide disinfectant, UV sterilizers, and neck strips',
        'Client booking apps (Acuity, Square, Vagaro) and merchant processing fees'
      ]
    },
    'Rideshare': {
      title: 'Rideshare & Delivery Drivers',
      items: [
        'Standard business mileage rate (67¢ per mile) from pickup to drop-off',
        'Cell phone split (business percentage of monthly phone bill and data)',
        'Dashboard mounts, multi-port USB chargers, dash cam equipment',
        'Car washes, interior vacuuming, detailing, and air fresheners',
        'Tolls and parking fees incurred while actively operating for hire'
      ]
    }
  };

  const data = checklists[tradeName] || checklists['Realtor'];

  let modal = document.getElementById('checklist-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'checklist-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div>
          <span class="eyebrow">Industry Deduction Guide</span>
          <h3 style="margin-top:2px">${data.title}</h3>
        </div>
        <button type="button" class="modal-close" onclick="closeModal('checklist-modal')">&times;</button>
      </div>
      <div class="modal-body">
        <p class="small" style="color:var(--ink-2);margin-bottom:14px">
          These key deduction categories apply directly to your federal Schedule C or business return:
        </p>
        <ul class="ticks" style="line-height:1.6;font-size:.88rem">
          ${data.items.map(it => `<li><b>${it.split(',')[0]}:</b> ${it}</li>`).join('')}
        </ul>
        <div class="callout" style="margin-top:18px">
          <span class="h">IRS Audit Standard</span>
          <p class="small">Every deduction requires contemporaneously maintained receipts or mileage logs. Pivot Aide Tax provides free log templates when you file with us.</p>
        </div>
        <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px">
          <button type="button" class="btn btn-o sm" onclick="closeModal('checklist-modal')">Close</button>
          <button type="button" class="btn btn-g sm" onclick="closeModal('checklist-modal'); openBookingModal('consultation')">Discuss With Uncle Pat &rarr;</button>
        </div>
      </div>
    </div>
  `;

  openModal('checklist-modal');
};

