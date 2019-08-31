describe("Payoff javascript library", function() {
    it("exists.", function() {
        expect(Payoff).not.toBe(jasmine.any(Function));
    });

    describe("payoff instances", function() {
        var payoff;

        payoff = new Payoff({
            rate: 0.04,
            duration: 360,
            amount: 300000,
            startMonth: 1,
            startYear: 2018
        });

        it("constructs successfully.", function() {
            expect(payoff).toEqual(jasmine.any(Object));
        });

        it("has a 'monthlyPayment' property.", function() {
            var monthlyPayment = payoff.monthlyPayment;
            expect(monthlyPayment).toEqual(jasmine.any(Number));
            expect(monthlyPayment > 0).toBe(true);
        });

        it("generates an amortization 'table'.", function() {
            expect(payoff.table).toEqual(jasmine.any(Array));
        });
    });
});