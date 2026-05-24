// ... existing imports ...

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        this.loading = true;

        this.accountService.login(this.f['email'].value, this.f['password'].value)
            .pipe(first())
            .subscribe({
                next: () => {
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: error => {
                    // 🚀 DEBUG CHANGE: Log the error and show an alert
                    console.error("Login failed on backend:", error);
                    
                    // Display the error message from the backend, or a default one
                    const errorMessage = error.error?.message || error.message || "Unknown error occurred.";
                    alert("Login failed: " + errorMessage);
                    
                    this.loading = false;
                }
            });
    }
