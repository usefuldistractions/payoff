describe('Payoff javascript library', function() {
    it('exists.', function() {
        expect(Payoff).not.toBe(jasmine.any(Function));
    });

    describe('payoff instances', function() {
        var payoff;

        payoff = new Payoff({
            rate: 0.04,
            duration: 360,
            amount: 300000,
            startMonth: 1,
            startYear: 2018
        });

        it('constructs successfully.', function() {
            expect(payoff).toEqual(jasmine.any(Object));
        });

        it('has an "amount" property.', function() {
            expect(payoff.amount).toEqual(jasmine.any(Number));
        });
        
        it('has an "interestPaid" property.', function() {
            expect(payoff.interestPaid).toEqual(jasmine.any(Number));
        });

        it('has a "startMonth" property.', function() {
            expect(payoff.startMonth).toEqual(jasmine.any(Number));
        });

        it('has a "startYear" property.', function() {
            expect(payoff.startYear).toEqual(jasmine.any(Number));
        });

        it('has a "monthlyPayment" property.', function() {
            var monthlyPayment = payoff.monthlyPayment;
            expect(monthlyPayment).toEqual(jasmine.any(Number));
            expect(monthlyPayment > 0).toBe(true);
        });

        it('has a "paid" property.', function() {
            expect(payoff.paid).toEqual(jasmine.any(Number));
        });

        it('has a "payoffDate" property.', function() {
            expect(payoff.payoffDate).toEqual(jasmine.any(String));
        });

        it('has a "payoffMonth" property.', function() {
            expect(payoff.payoffMonth).toEqual(jasmine.any(Number));
        });

        it('has a "payoffYear" property.', function() {
            expect(payoff.payoffYear).toEqual(jasmine.any(Number));
        });

        it('has a "principalPaid" property.', function() {
            expect(payoff.principalPaid).toEqual(jasmine.any(Number));
        });

        it('generates an amortization "table".', function() {
            expect(payoff.table).toEqual(jasmine.any(Array));
        });
    });
});