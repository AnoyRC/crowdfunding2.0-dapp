use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("DqGfiavJezxHcTPzDcvfhKraq4p9EfvEc6WgwycpnkWd");

#[program]
pub mod crowdfunding_dapp {
    use super::*;

    pub fn create(ctx: Context<Create>, name: String, description: String, max_amount: u64) -> ProgramResult {
        let campaign = &mut ctx.accounts.campaign;
        campaign.name = name;
        campaign.description = description;
        campaign.amount_donated = 0;
        campaign.max_amount = max_amount;
        campaign.admin = *ctx.accounts.user.key;
        campaign.amount_left = 0;
        Ok(())
    }    

    pub fn withdraw(ctx: Context<Withdraw>) -> ProgramResult{
        let campaign = &mut ctx.accounts.campaign;
        let user = &mut ctx.accounts.user;
        if campaign.admin != *user.key {
            return Err(ProgramError::IncorrectProgramId);
        }
        let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
        if **campaign.to_account_info().lamports.borrow() - rent_balance < campaign.amount_left {
            return Err(ProgramError::InsufficientFunds);
        }
        **campaign.to_account_info().try_borrow_mut_lamports()? -= campaign.amount_left;
        **user.to_account_info().try_borrow_mut_lamports()? += campaign.amount_left;
        campaign.amount_left = 0;
        Ok(())
    }
    
    pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.campaign.key(),
            amount
        );

        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.campaign.to_account_info()
            ]
        );

        (&mut ctx.accounts.campaign).amount_donated += amount;
        (&mut ctx.accounts.campaign).amount_left +=amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info>{
    #[account(init, payer=user, space=9000, seeds=[b"CAMPAIGN_DEMO".as_ref(), user.key().as_ref()], bump)]
    pub campaign: Account<'info, Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info,System>
}

#[derive(Accounts)]
pub struct Withdraw<'info>{
    #[account(mut)]
    pub campaign: Account<'info,Campaign>,
    #[account(mut)]
    pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct Donate<'info>{
    #[account(mut)]
    pub campaign: Account<'info,Campaign>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info,System>
}

#[account]
pub struct Campaign{
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub amount_donated: u64,
    pub max_amount: u64,
    pub amount_left: u64
}


