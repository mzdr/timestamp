class CustomButton extends HTMLButtonElement
{
    /**
     * Tell which native element it's extending. In this case it's <button>.
     *
     * @return {string}
     */
    static get extends()
    {
        return 'button';
    }
}
