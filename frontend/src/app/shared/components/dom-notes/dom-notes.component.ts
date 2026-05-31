import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dom-notes',
  standalone: true,
  template: '<section class="dom-notes" #host></section>'
})
export class DomNotesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) private readonly host!: ElementRef<HTMLElement>;

  private cleanupHandlers: Array<() => void> = [];

  ngAfterViewInit(): void {
    const container = this.host.nativeElement;
    const title = document.createElement('h2');
    const form = document.createElement('form');
    const input = document.createElement('input');
    const button = document.createElement('button');
    const counter = document.createElement('small');
    const list = document.createElement('ul');

    title.textContent = 'Focus Notes';
    input.type = 'text';
    input.placeholder = 'Add a quick note';
    input.maxLength = 80;
    button.type = 'submit';
    button.textContent = 'Add';
    counter.textContent = '0/80';
    list.className = 'note-list';

    form.append(input, button);
    container.append(title, form, counter, list);

    const renderNote = (message: string): void => {
      const item = document.createElement('li');
      const text = document.createElement('span');
      const remove = document.createElement('button');

      text.textContent = message;
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => item.remove());

      item.append(text, remove);
      list.prepend(item);
    };

    const inputListener = (): void => {
      counter.textContent = `${input.value.length}/80`;
    };

    const submitListener = (event: SubmitEvent): void => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message) {
        input.focus();
        return;
      }

      renderNote(message);
      input.value = '';
      counter.textContent = '0/80';
      input.focus();
    };

    input.addEventListener('input', inputListener);
    form.addEventListener('submit', submitListener);

    this.cleanupHandlers = [
      () => input.removeEventListener('input', inputListener),
      () => form.removeEventListener('submit', submitListener)
    ];

    renderNote('Review blocked tasks before standup.');
  }

  ngOnDestroy(): void {
    for (const cleanup of this.cleanupHandlers) {
      cleanup();
    }
  }
}
