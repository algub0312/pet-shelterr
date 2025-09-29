//Contact form handling

document.addEventListener('DOMContentLoaded', function(){
    const contactForm = document.getElementById('contact-form');

    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            //Get form data
            const formData = new FormData(contactForm);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const subject = formData.get('subject');
            const message = formData.get('message');
            const preferredContact = formData.get('preferredContact')

            //Simple validation
            if(!fullName || !email || !subject || !message || !phone) {
                alert('Please fill in all the required fields.');
                return;
            }
            //Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)) {
                alert('Please enter a valid email adress.');
                return;
            }
            //later send data to server
            //for now show succes message
            alert('Thank you for your message we will get to you soon.')

            //Reset form
            contactForm.reset();
        })
    }
})
